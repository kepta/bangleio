import React from 'react';
import Editor from './Editor';
import { EditorState, convertFromRaw } from 'draft-js';
import { getCurrentPage } from './network/getData';
import { setCurrentPageThrottled } from './network/setData';
// import firebase from 'firebase';

let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}

export default class Content extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  state = {
    editorState: EditorState.createEmpty(),
    timeStamp: Date.now(),
  }
  componentDidMount() {
    // this.refs.editor.focus();
    getCurrentPage(pn)
      .then(this.updateEditor);
    this.pollServer();
  }
  onEditorChange = (editorState) => {
    // console.debug('onEditorChange');
    const didContentChange = editorState.getCurrentContent() !== this.state.editorState.getCurrentContent();
    const date = Date.now();
    if (didContentChange) {
      this.writeUserData(editorState, date);
    }
    // console.log(didContentChange, Date.now());
    this.setState({ editorState, timeStamp: didContentChange ? date : this.state.timeStamp });
  };

  lastSent = Date.now();

  pollServer = () => {
    // CHECK: snapshot should have editorState and timeStamp
    this.props.database.ref(`data/${pn}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      console.log('"fetched"', content.timeStamp, content.timeStamp === this.state.timeStamp);
      if (content.timeStamp > this.state.timeStamp) {
        this.updateEditor(content);
      }
    });
  }

  focus = () => this.refs.editor.focus();

  writeUserData = (editorState, date) => {
    setCurrentPageThrottled(pn, editorState.getCurrentContent(), date);
  }
  updateEditor = (content) => {
    if (content && content.editorState) {
      // console.debug("updagteEditor", content.timeStamp);
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(content.editorState))),
        timeStamp: content.timeStamp,
      });
    }
  }
  render() {
    return (
      <div>
        <Editor
          onEditorChange={this.onEditorChange}
          editorState={this.state.editorState}
          placeholder="Enter some text..."
          ref="editor"
        />
      </div>
    );
  }
}
