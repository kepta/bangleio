import React from 'react';
import Editor from './Editor';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EditorState, convertFromRaw, SelectionState } from 'draft-js';
import { setCurrentPageThrottled, updateHistory } from './network/setData';
import * as actions from './redux/actions';
const THRESHOLD = 1000;

function debounce(func, wait, immediate) {
  let timeout;
  return function foo(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

function printData(contentState, key) {
  console.log(key, !!contentState.getBlockForKey(key), contentState.getBlockForKey(key) && contentState.getBlockForKey(key).getText());
}

let lastMerged = 0;

function mergeEditorState(editor, localState) {
  console.log("crash",editor.seed, editor.seedMap.get(editor.seed));
  if (editor.seedMap.get(editor.seed)) {
    console.log('resusing used state');
    return localState;
  }
  if (lastMerged !== editor.networkTimeStamp) {
    console.log('lastMerged != networkTimeStamp');
    lastMerged = editor.networkTimeStamp;
    return editor.editorState;
  }
  return localState;
}

function mapStateToProps(state) {
  return { ...state.reducer };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Content extends React.Component {
  static propTypes = {
    getCurrentPage: React.PropTypes.func,
    setCurrentPage: React.PropTypes.func,
    recCurrentPage: React.PropTypes.func,
    editor: React.PropTypes.object,
    firebase: React.PropTypes.object,
  }

  state = {
    editorState: EditorState.createEmpty(),
    count: 0,
  }

  componentDidMount() {
    this.props.getCurrentPage(this.props.editor.page);
    this.pollServer();
  }

  onEditorChange = (editorState) => {
    const count = this.state.count + 1;
    this.setState({ editorState, count });
    if (editorState.getCurrentContent() !== this.props.editor.editorState.getCurrentContent()) {
      console.debug("redux editor state not equal state.editor");
      return this.setCurrentPageThrottled(
        this.props.editor.seed, this.props.editor.page, editorState.getCurrentContent(), count
      );
    }
    console.debug("same state of redux editor and state");


  }

  pollServer = () => {
    const { firebase, editor } = this.props;
    // CHECK: snapshot should have editorState and timeStamp
    firebase.database.ref(`data/${editor.page}`).on('child_changed', (snapshot) => {
      const content = snapshot.val();
      this.props.recCurrentPage(content);
    });
    // polling every 2 sec just in case child_changed didn't fire
    // setInterval(() => {
    //   if (Date.now() - this.lastUpdated > INTERVAL) {
    //     this.lastUpdated = Date.now();
    //     getCurrentPage(pn)
    //       .then((content) => {
    //         console.debug('polled to get data', content.timeStamp);
    //         this.updateEditor(content);
    //       });
    //   }
    // }, INTERVAL);
  }

  focus = () => this.refs.editor.clickHandler();

  setCurrentPageThrottled = debounce(this.props.setCurrentPage, THRESHOLD, false)

  writeUserData = (editorState, timeStamp) => {
    if (editorState.getCurrentContent() !== this.props.editor.editorState) {
      console.debug("redux editor state not equal state.editor");
      return setCurrentPageThrottled(editorState.getCurrentContent());
    }
    console.debug("same state of redux editor and state");
  }

  updateRevisionEditor = (editorState) => {
    this.setState({
      editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(editorState))),
      timeStamp: Date.now(),
    });
  }

  // onSubmit = () => {
  //   updateHistory(pn, editorState.getCurrentContent(), Date.now(), this.props.database);
  // }

  render() {
    const { editor } = this.props;
    return (
      <div style={{ margin: '0 10px', height: '100%' }} onClick={this.focus}>
        <Editor
          onEditorChange={this.onEditorChange}
          editorState={this.state.editorState}
          placeholder="Enter some text..."
          ref="editor"
        />
        <br />
        <button onClick={this.onSubmit}> Submit </button>
        <br />
        <div>
        </div>
      </div>
    );
  }
}
