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

const POLL_INTERVAL = 600;

export default class App extends React.Component {
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
    this.writeUserData(editorState);
    this.setState({ editorState, timeStamp: Date.now() });
  };

  pollServer = () => {
    // CHECK: snapshot should have editorState and timeStamp
    this.props.database.ref(`data/${pn}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      if (content.timeStamp > this.state.timeStamp) {
        this.updateEditor(content);
      }
    });
  }

  writeUserData = () => {
    setCurrentPageThrottled(pn, this.state.editorState.getCurrentContent(), this.state.timeStamp);
  }
  updateEditor = (content) => {
    if (content && content.editorState) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(content.editorState))),
        timeStamp: content.timeStamp,
      });
    }
  }
  render() {
    return (
      <div>
        <h1>
          Bangle.io
        </h1>
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
