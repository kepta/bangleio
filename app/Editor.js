import React from 'react';
import { Editor } from 'draft-js';

export default class MyEditor extends React.Component {
  static propTypes = {
    editorState: React.PropTypes.object,
    onEditorChange: React.PropTypes.func,
  }
  clickHandler = () => this.refs.editor.focus();
  render() {
    return <Editor ref="editor" editorState={this.props.editorState} onChange={this.props.onEditorChange} />;
  }
}
