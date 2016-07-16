import React from 'react';
import Editor from './Editor';
import { EditorState, convertFromRaw } from 'draft-js';
import { getCurrentPage } from './network/getData';
import { setCurrentPageThrottled } from './network/setData';

let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}

const INTERVAL = 2500;

export default class Content extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  state = {
    editorState: EditorState.createEmpty(),
    timeStamp: Date.now(),
  }

  componentDidMount() {
    getCurrentPage(pn)
      .then(this.updateEditor);
    this.pollServer();
  }
  onEditorChange = (editorState) => {
    // console.debug('onEditorChange');
    const didContentChange = editorState.getCurrentContent() !== this.state.editorState.getCurrentContent();
    const timeStamp = Date.now();
    if (didContentChange) {
      this.writeUserData(editorState, timeStamp);
    }
    this.setState({ editorState, timeStamp: didContentChange ? timeStamp : this.state.timeStamp });
  };

  lastUpdated = Date.now();

  pollServer = () => {
    // CHECK: snapshot should have editorState and timeStamp
    this.props.database.ref(`data/${pn}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      if (content.timeStamp > this.state.timeStamp) {
        console.debug('child_changed event fired');
        this.lastUpdated = Date.now();
        this.updateEditor(content);
      }
    });

    // polling every 2 sec just in case child_changed didn't fire
    setInterval(() => {
      if (Date.now() - this.lastUpdated > INTERVAL) {
        this.lastUpdated = Date.now();
        getCurrentPage(pn)
          .then((content) => {
            if (content.timeStamp > this.state.timeStamp) {
              console.debug('polled to get data');
              this.updateEditor(content);
            }
          });
      }
    }, INTERVAL);
  }

  focus = () => this.refs.editor.focus();

  writeUserData = (editorState, timeStamp) => {
    setCurrentPageThrottled(pn, editorState.getCurrentContent(), timeStamp);
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
