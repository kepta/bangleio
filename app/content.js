import React from 'react';
import Editor from './Editor';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { debounce } from './helpers';
import { convertToRaw } from 'draft-js';
import { OrderedMap } from 'immutable';

const THRESHOLD = 1500;

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
    editor: React.PropTypes.object,
    firebase: React.PropTypes.object,
  }

  state = {
    editorState: this.props.editor.editorState,
    count: 0,
  }

  componentDidMount() {
    this.props.getPage(this.props.editor.pageName);
  }

  processData = (editorState) => {
    const blockMap = editorState.getCurrentContent().getBlockMap();
    if (this.lastBlockMap !== blockMap) {
      this.lastBlockMap = blockMap;
      // console.log(blockMap.toJS());
      window.pp = editorState.getCurrentContent().getBlocksAsArray();
      // var p = ContentState.createFromBlockArray(OrderedMap(editorState.getCurrentContent().getBlockMap().toJS()).toSeq().toArray());
      const raw = convertToRaw(editorState.getCurrentContent());
      console.log(raw.map(e => ({...e, count: 0})));
      this.props.setPage(this.props.editor.pageName, raw);
    }
  }

  setPageThrottle = debounce(this.processData, THRESHOLD, false);

  lastContent = null;

  render() {
    return (
      <div style={{ margin: '0 10px', height: '100%' }} onClick={this.focus}>
      {
        this.props.editor.rawDraftContentState ?
          <Editor
            rawDraftContentState={this.props.editor.rawDraftContentState}
            setPage={this.setPageThrottle}
            pageName={this.props.editor.pageName}
            placeholder="Enter some text..."
            ref="editor"
          />
        : null
      }
      </div>
    );
  }
}
