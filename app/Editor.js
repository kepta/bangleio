import React from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';

// let saveContent = JSON.parse(localStorage.getItem('safe'));

export default class MyEditor extends React.Component {
  // constructor(props) {
    // super(props);
    //
    // if (!saveContent || saveContent === 'undefined') {
    //   saveContent = EditorState.createEmpty();
    // } else {
    //   saveContent = EditorState.createWithContent(convertFromRaw(saveContent));
    // }
    //
    // this.state = { editorState: saveContent };
    // this.onChange = (editorState) => {
    //   localStorage.setItem('safe', JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    //   this.setState({ editorState });
    // };
  // }
  render() {
    return <Editor editorState={this.props.editorState} onChange={this.props.onEditorChange} />;
  }
}
