import React from 'react';
import draft, { Editor, EditorState, convertFromRaw } from 'draft-js';
import { debounce } from './helpers';
import LocalContent from './operations/LocalContent';
// window.draft = draft;
// window.immutable = immutable;

const THRESHOLD = 1500;

export default class MyEditor extends React.Component {
  static propTypes = {
    pageName: React.PropTypes.string,
    setPage: React.PropTypes.func,
    contentState: React.PropTypes.object,
    sendData: React.PropTypes.func,
    firebase: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      readonly: false,
      editorState: EditorState.createWithContent(
        convertFromRaw(props.contentState),
      ),
    };
    this.LocalContent = new LocalContent(
      props.pageName,
      () => this.state.editorState,
      this.setContentState,
      props.firebase
    );
    this.syncEditorState = debounce(this.LocalContent.syncEditorState, THRESHOLD, false);
  }

  setContentState = (contentState) => {
    let editorState = this.state.editorState;
    const updatedSelection = this.state.editorState.getSelection();
    editorState = EditorState.push(
      editorState,
      contentState,
      'change-block-data'
    );
    editorState = EditorState.forceSelection(
      editorState,
      updatedSelection,
    );
    this.setState({
      editorState,
    });
  }

  shouldComponentUpdate(props, nextState) {
    return nextState.editorState !== this.state.editorState;
  }

  onChange = (editorState) => this.setState({ editorState });

  render() {
    // this.sendData(this.state.editorState);
    // window.editorState = this.state.editorState;
    if (this.LocalContent) {
      this.syncEditorState(this.state.editorState);
    }
    return <Editor ref="editor" readOnly={this.state.readOnly} editorState={this.state.editorState} onChange={this.onChange} />;
  }
}
