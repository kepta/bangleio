import React from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw, SelectionState } from 'draft-js';
import { mergeArray } from './helpers';


export default class MyEditor extends React.Component {
  static propTypes = {
    setPage: React.PropTypes.func,
    pageName: React.PropTypes.string,
    contentState: React.PropTypes.object,
    lastEditorState: React.PropTypes.object,
  }

  state = {
    editorState: this.props.contentState === 'blank' ?
    EditorState.createEmpty() :
    EditorState.createWithContent(
      convertFromRaw(this.props.contentState),
    ),
  }

  mergePendingDiff = (editorState) => {
    const raw = convertToRaw(editorState.getCurrentContent());
    const rawBlocksLocal = raw.blocks;
    const rawBlocksNetwork = this.props.pendingDiff.contentState.blocks;

    const blocksMerged = mergeArray(rawBlocksLocal, rawBlocksNetwork, (a, b) => {
      const localBlocksCount = this.props.blocksCount;
      const networkBlocksCount = this.props.pendingDiff.blocksCount;
      if (networkBlocksCount[a.key] === -1) return -1;
      if (!networkBlocksCount[a.key]) {
        return a;
      }
      if (!localBlocksCount[a.key]) {
        return b;
      }
      if (networkBlocksCount[a.key].times > localBlocksCount[a.key].times) {
        return b;
      }
      return a;
    });

    raw.blocks = blocksMerged;

    const currentSelectionKey = editorState.getSelection().getFocusKey();
    const currentSelectionOffset = editorState.getSelection().getFocusOffset();

    let newEditorState = EditorState.push(
      editorState,
      convertFromRaw(raw),
      'change-block-data'
    );

    const selectionState = SelectionState.createEmpty(currentSelectionKey);
    const updatedSelection = selectionState.merge({
      focusKey: currentSelectionKey,
      focusOffset: currentSelectionOffset,
      anchorOffset: currentSelectionOffset,
    });

    newEditorState = EditorState.acceptSelection(
      newEditorState,
      updatedSelection,
    );
    this.newEditorState = newEditorState;
    this.timer = setTimeout(() => {
      console.log("crash");
      this.setState({ editorState: newEditorState });
      this.newEditorState = null;
    }, 500);
  }

  onEditorChange = (editorState) => {
    if (this.newEditorState) {
      console.log("crash2");

      this.setState({ editorState: this.newEditorState });
      clearTimeout(this.timer);
      this.newEditorState = null;
    } else {
      this.setState({ editorState });
      this.props.setPage(editorState);
    }
  }

  clickHandler = () => this.refs.editor.focus();
  render() {
    if (this.props.pendingDiff) {
      this.props.removeDiff();
      this.mergePendingDiff(this.state.editorState);
    }
    return <Editor ref="editor" editorState={this.state.editorState} onChange={this.onEditorChange} />;
  }
}
