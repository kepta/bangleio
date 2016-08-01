import React from 'react';
import draft, { Editor, EditorState, convertToRaw, convertFromRaw, SelectionState } from 'draft-js';
import { mergeContent, debounce, replaceLine, removeLine, insertLines } from './helpers';
import LocalContent from './operations/LocalContent';
import immutable from 'immutable';
window.draft = draft;
window.immutable = immutable;
const DELETE = 'DELETE';
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
    window.LocalContent = this.LocalContent;
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
    editorState = EditorState.acceptSelection(
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


  mergePendingDiff = (pendingDiff) => {
    const editorState = this.state.editorState;

    const updatedSelection = editorState.getSelection();

    this.setState({ readOnly: true });
    const rawBlocksNetwork = pendingDiff.contentState.blocks;

    const currentContent = mergeContent(editorState.getCurrentContent(), rawBlocksNetwork, (a, b) => {
      const localBlocksCount = this.props.blocksCount;
      const networkBlocksCount = pendingDiff.blocksCount;
      if (!networkBlocksCount[a.key]) {
        return a;
      }
      if (!localBlocksCount[a.key]) {
        return b;
      }
      if (networkBlocksCount[a.key] === -1) return -1;

      if (a.key === editorState.getSelection().getFocusKey()) {
        return a;
      }

      return b;
    });

    let newEditorState = EditorState.push(
      editorState,
      currentContent,
      'change-block-data'
    );

    newEditorState = EditorState.acceptSelection(
      newEditorState,
      updatedSelection,
    );

    this.setState({
      readOnly: false,
      editorState: newEditorState,
    });
  }

  pushToEditor = (oldEditorState, currentContent, selection) => {
    const newEditorState = EditorState.push(
      oldEditorState,
      currentContent,
      'change-block-data'
    );

    return EditorState.acceptSelection(
      newEditorState,
      selection,
    );
  }

  addLines = (rawContentState) => {
    const editorState = this.state.editorState;

    const updatedSelection = editorState.getSelection();
    const rawBlocksNetwork = rawContentState.blocks;

    this.setState({ readOnly: true });
    console.debug('adding lines');
    const currentContent = insertLines(editorState.getCurrentContent(), rawBlocksNetwork);

    let newEditorState = EditorState.push(
      editorState,
      currentContent,
      'change-block-data'
    );

    newEditorState = EditorState.acceptSelection(
      newEditorState,
      updatedSelection,
    );

    this.setState({
      readOnly: false,
      editorState: newEditorState,
    });
  }

  mergeOrDeleteLine = (block) => {
    if (!block) return;

    const editorState = this.state.editorState;
    const updatedSelection = editorState.getSelection();
    const localBlock = editorState.getCurrentContent().getBlockForKey(block.key);

    if (localBlock && (localBlock.hashCode() !== block.hashCode)) {
      this.setState({ readOnly: true });
      let contentState = editorState.getCurrentContent();
      if (block.hashCode === DELETE) {
        contentState = removeLine(contentState, block.key);
      } else {
        contentState = replaceLine(contentState, block.key, block.text);
      }
      this.setState({
        readOnly: false,
        editorState: this.pushToEditor(editorState, contentState, updatedSelection),
      });
    }
  }

  onChange = (editorState) => this.setState({ editorState });

  clickHandler = () => this.refs.editor.focus();

  render() {
    // this.sendData(this.state.editorState);
    window.editorState = this.state.editorState;
    if (this.LocalContent) {
      this.syncEditorState(this.state.editorState);
    }
    return <Editor ref="editor" readOnly={this.state.readOnly} editorState={this.state.editorState} onChange={this.onChange} />;
  }
}
