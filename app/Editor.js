import React from 'react';
import { Editor } from 'draft-js';

export default class MyEditor extends React.Component {
  propTypes = {
    editorState: React.PropTypes.object,
  }
  render() {
    return <Editor editorState={this.props.editorState} onChange={this.props.onEditorChange} />;
  }
}
