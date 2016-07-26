import React from 'react';
import Editor from './Editor';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { debounce, getCountChange } from './helpers';
import { convertToRaw, EditorState, convertFromRaw } from 'draft-js';
import { OrderedMap } from 'immutable';
import { getPage } from './network/getData';

const THRESHOLD = 1500;
const INTERVAL = 5000;

function mapStateToProps(state) {
  return { ...state.reducer };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Content extends React.Component {
  static propTypes = {
    getPage: React.PropTypes.func,
    setPage: React.PropTypes.func,
    recPage: React.PropTypes.func,
    removeDiff: React.PropTypes.func,
    createDiff: React.PropTypes.func,
    editor: React.PropTypes.object,
    firebase: React.PropTypes.object,
  }

  componentDidMount() {
    this.props.getPage(this.props.editor.pageName);
    this.childChange();
  }

  lastUpdated = 0

  childChange = () => {
    this.props.firebase.database.ref(`data/${this.props.editor.pageName}`).on('child_changed', (snapshot) => {
      const data = snapshot.val();
      this.lastUpdated = Date.now();
      if (data && data.uid !== this.props.editor.uid && this.props.editor.hash !== data.hashCode) {
        data.contentState = JSON.parse(data.contentState);
        this.props.createDiff(data);
      }
    });
    setInterval(() => {
      if (Date.now() - this.lastUpdated > INTERVAL) {
        this.lastUpdated = Date.now();
        getPage(this.props.editor.pageName)
        .then((data) => {
          const ret = data;
            if (data && data.uid !== this.props.editor.uid && this.props.editor.hash !== data.hashCode) {
              ret.contentState = JSON.parse(ret.contentState);
              this.props.createDiff(ret);
            }
        });
      }
    }, INTERVAL);
  }

  processData = (editorState) => {
    const blockMap = editorState.getCurrentContent().getBlockMap();
    if (this.lastBlockMap !== blockMap) {
      const { uid, blocksCount } = this.props.editor;
      const raw = convertToRaw(editorState.getCurrentContent());
      const newBlocksCount = getCountChange(uid, blocksCount, blockMap, this.lastBlockMap);
      this.props.setPage(editorState, this.props.editor.pageName, raw, newBlocksCount, this.props.editor.uid, blockMap.hashCode());
      this.lastBlockMap = blockMap;
    }
  }

  setPageThrottle = debounce(this.processData, THRESHOLD, false);

  lastContent = null;

  render() {
    return (
      <div style={{ margin: '0 10px', height: '100%' }} onClick={this.focus}>
        {this.props.editor.contentState ?
          <Editor
            lastEditorState={this.props.editor.lastEditorState}
            blocksCount={this.props.editor.blocksCount}
            pendingDiff={this.props.editor.pendingDiff}
            removeDiff={this.props.removeDiff}
            setPage={this.setPageThrottle}
            pageName={this.props.editor.pageName}
            contentState={this.props.editor.contentState}
            placeholder="Enter some text..."
            ref="editor"
          />
        : null}
      </div>
    );
  }
}
