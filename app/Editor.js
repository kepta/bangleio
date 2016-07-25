import React from 'react';
import { Editor, EditorState, convertFromRaw } from 'draft-js';


export default class MyEditor extends React.Component {
  static propTypes = {
    rawDraftContentState: React.PropTypes.object.isRequired,
    setPage: React.PropTypes.func,
    pageName: React.PropTypes.string,
    // onEditorChange: React.PropTypes.func,
  }

  state = {
    editorState: EditorState.createWithContent(
      convertFromRaw(this.props.rawDraftContentState),
    )
  }

  onEditorChange = (editorState) => {
    this.setState({ editorState });
    this.props.setPage(editorState);
  }

  clickHandler = () => this.refs.editor.focus();
  render() {
    console.log(this.props.rawDraftContentState);
    return <Editor ref="editor" editorState={this.state.editorState} onChange={this.onEditorChange} />;
  }
}
