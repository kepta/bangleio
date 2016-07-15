import React from 'react';
import Editor from './Editor';
import History from './History';
import { EditorState, convertFromRaw } from 'draft-js';
import { getCurrentPage } from './network/getData';
import { setCurrentPageThrottled, updateHistory } from './network/setData';
import { mergeState } from './utility/mergeUtility';
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
    currentJsonText: null,
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

  lastSent = Date.now();

  pollServer = () => {
    // CHECK: snapshot should have editorState and timeStamp
    this.props.database.ref(`data/${pn}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      // console.log('"crash"');
      if (content.timeStamp > this.state.timeStamp) {
        this.updateEditor(content);
      }
    });
  }

  focus = () => this.refs.editor.focus();

  writeUserData = () => {
    setCurrentPageThrottled(pn, this.state.editorState.getCurrentContent(), this.state.timeStamp);
  }
  updateEditor = (content) => {

    if (content && content.editorState) {
      if(this.state.currentJsonText == null){
        this.setState({ currentJsonText: JSON.parse(content.editorState) });
      } else {
        const newState = mergeState(this.state.currentJsonText, JSON.parse(content.editorState));
        this.setState({ currentJsonText: newState });
      }
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(content.editorState))),
        timeStamp: content.timeStamp,
      });
    }
  }
  updateRevisionEditor = (state) => {
    // console.log(state);
    this.setState({ editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(state))), timeStamp: Date.now() });
  }
  onSubmit = () => {
    const editorState = this.state.editorState;
    updateHistory(pn, editorState.getCurrentContent(), Date.now(), this.props.database);
  }
  render() {
    return (
      <div className="container" id="editor">
        <Editor
          onEditorChange={this.onEditorChange}
          editorState={this.state.editorState}
          placeholder="Enter some text..."
          ref="editor"
        />
        <br />
        <button onClick={this.onSubmit}> Submit </button>
        <br />
        <div>
          <History database={this.props.database} updateEditor={this.updateRevisionEditor} />
        </div>
      </div>
    );
  }
}
