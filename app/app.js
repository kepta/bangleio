import React from 'react';
import Editor from './Editor';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

// const Database = database();
let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}
export default class App extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  state = {
    editorState: EditorState.createEmpty(),
  }
  componentDidMount() {
    console.log(this.props);
    this.props.database.ref(`data/${pn}`).on('child_added', (snapshot) => {
      this.updateEditor(snapshot.val());
    });
  }
  onEditorChange = (editorState) => {
    this.writeUserData(editorState);
    this.setState({ editorState });
  };
  writeUserData = (editorState) => {
    this.props.database.ref(`data/${pn}`).push({
      editorState: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    });
  }
  updateEditor = (content) => {
    if (content.editorState) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(content.editorState))),
      });
    }
  }
  render() {
    return (
      <div>
        <h1>
          Bangle.io
        </h1>
        {
          this.state.editorState ? <Editor onEditorChange={this.onEditorChange} editorState={this.state.editorState} /> : null
        }
      </div>
    );
  }
}
