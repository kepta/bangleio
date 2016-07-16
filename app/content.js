import React from 'react';
import Editor from './Editor';
import { EditorState, convertFromRaw, SelectionState } from 'draft-js';
import { getCurrentPage } from './network/getData';
import { setCurrentPageThrottled } from './network/setData';

let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}

function printData(contentState, key) {
  console.log(key, !!contentState.getBlockForKey(key), contentState.getBlockForKey(key) && contentState.getBlockForKey(key).getText());
}

const INTERVAL = 2500;

export default class Content extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  state = {
    editorState: EditorState.createEmpty(),
    timeStamp: Date.now(),
  }

  componentDidMount() {
    getCurrentPage(pn)
      .then(this.updateEditor);
    this.pollServer();
  }
  onEditorChange = (editorState) => {
    window.editorState = editorState;
    const didContentChange = editorState.getCurrentContent() !== this.state.editorState.getCurrentContent();
    const timeStamp = Date.now();
    if (didContentChange) {
      this.writeUserData(editorState, timeStamp);
    }
    this.setState({ editorState, timeStamp: didContentChange ? timeStamp : this.state.timeStamp });
  };

  lastUpdated = Date.now();

  pollServer = () => {
    // CHECK: snapshot should have editorState and timeStamp
    this.props.database.ref(`data/${pn}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      if (content.timeStamp > this.state.timeStamp) {
        console.debug('child_changed event fired', content.timeStamp);
        this.lastUpdated = Date.now();
        this.updateEditor(content);
      }
    });

    // polling every 2 sec just in case child_changed didn't fire
    setInterval(() => {
      if (Date.now() - this.lastUpdated > INTERVAL) {
        this.lastUpdated = Date.now();
        getCurrentPage(pn)
          .then((content) => {
            if (content && (content.timeStamp > this.state.timeStamp)) {
              console.debug('polled to get data', content.timeStamp);
              this.updateEditor(content);
            }
          });
      }
    }, INTERVAL);
  }

  focus = () => this.refs.editor.clickHandler();

  writeUserData = (editorState, timeStamp) => {
    setCurrentPageThrottled(pn, editorState.getCurrentContent(), timeStamp);
  }
  updateEditor = (content) => {
    if (content && content.editorState) {
      const { editorState } = this.state;
      const currentContentState = editorState.getCurrentContent();
      const currentSelectionKey = editorState.getSelection().getFocusKey();
      const currentSelectionOffset = editorState.getSelection().getFocusOffset();
      const currentBlock = currentContentState.getBlockForKey(currentSelectionKey);
      // console.log(currentSelectionKey, currentSelectionOffset, currentBlock.getText());

      let newEditorState = EditorState.push(
        this.state.editorState,
        convertFromRaw(JSON.parse(content.editorState)),
        'change-block-data'
      );
      const selectionState = SelectionState.createEmpty(currentSelectionKey);
      var updatedSelection = selectionState.merge({
        focusKey: currentSelectionKey,
        focusOffset: currentSelectionOffset,
        anchorOffset: currentSelectionOffset,
      });


      // console.log(updatedSelection.getFocusOffset(), newEditorState.getCurrentContent().getBlockForKey(updatedSelection.getFocusKey()).getText());

      newEditorState = EditorState.acceptSelection(
        newEditorState,
        updatedSelection,
      );
      const newContentState = newEditorState.getCurrentContent();
      printData(newContentState, '59qnh');
      printData(currentContentState, '59qnh');
      printData(newContentState, newEditorState.getSelection().getFocusKey());
      console.log(editorState.getSelection().getFocusKey(), editorState.getSelection().getAnchorKey());
      // console.log(currentContentState.getBlocksAsArray().map((f) => ({ key: f.getKey(), data: f.getText() }) ));
      // console.log(newEditorState.getCurrentContent().getBlocksAsArray().map((f) => ({ key: f.getKey(), data: f.getText() }) ));
      // console.log(newEditorState.getCurrentContent().getBlockForKey(newEditorState.getSelection().getFocusKey()));

      this.setState({
        editorState: newEditorState,
        timeStamp: content.timeStamp,
      });
    }
  }
  render() {
    return (
      <div style={{ margin: '0 10px', height: '100%' }} onClick={this.focus}>
        <Editor
          onEditorChange={this.onEditorChange}
          editorState={this.state.editorState}
          placeholder="Enter some text..."
          ref="editor"
        />

      </div>
    );
  }
}
