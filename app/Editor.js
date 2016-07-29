import React from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw, SelectionState } from 'draft-js';
import { mergeContent } from './helpers';
import { difference } from './operations/difference';
import { debounce } from './helpers';

export default class MyEditor extends React.Component {
  static propTypes = {
    setPage: React.PropTypes.func,
    contentState: React.PropTypes.object,
  }

  state = {
    readonly: false,
    editorState: this.props.contentState === 'blank' ?
    EditorState.createEmpty() :
    EditorState.createWithContent(
      convertFromRaw(this.props.contentState),
    ),
  }

  shouldComponentUpdate(props, nextState) {
    return nextState.editorState !== this.state.editorState;
  }

  componentDidMount() {
    window.onChange = this.onChange;

    setTimeout(() => {

    }, 10000);
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

  onChange = (editorState) => this.setState({ editorState });

  differenceFunction = debounce(difference, 1000, false);


  clickHandler = () => this.refs.editor.focus();
  render() {
    differenceFunction(this.state.editorState);
    return <Editor ref="editor" readOnly={this.state.readOnly} editorState={this.state.editorState} onChange={this.onChange} />;
  }
}
