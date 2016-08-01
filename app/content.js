import React from 'react';
import Editor from './Editor';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { debounce, getCountChange } from './helpers';
import draft, { convertToRaw, EditorState, convertFromRaw, SelectionState, Modifier } from 'draft-js';
import immutable, { OrderedMap } from 'immutable';
import { getPage } from './network/getData';

window.draft = draft;
window.immutable = immutable;

const THRESHOLD = 1500;
const INTERVAL = 1500;

const DELETE = 'DELETE';
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
    saveContentState: React.PropTypes.func,
    saveData: React.PropTypes.func,
    editor: React.PropTypes.object,
    firebase: React.PropTypes.object,
  }

  componentDidMount() {
    this.props.getPage(`${this.props.editor.pageName}/current`);
    // this.childChange();
  }

  childChange = () => {
    this.props.firebase.database.ref('.info/connected')
    .on('value', (snap) => {
      if (snap.val() === true) {
        console.debug('connected');
      } else {
        console.debug('not connected');
      }
    });
    this.props.firebase.database.ref(`data/${this.props.editor.pageName}/current/blocksCount`).on('child_changed', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      console.log('automagically updated', data.key);
      if (this.refs.editor)
        this.refs.editor.mergeOrDeleteLine(data);
    });

    const fireRef = this.props.firebase.database.ref(`data/${this.props.editor.pageName}/current/contentState`);

    fireRef.on('value', (snap) => {
      const data = snap.val();
      if (!data) return;
      if (this.refs.editor) this.refs.editor.addLines(JSON.parse(data));
    });

    setInterval(() => {
        this.lastUpdated = Date.now();
        if (!this.props.editor.editorState) return;
        fireRef.transaction((rawContentState) => {
            if ( Date.now() - this.lastUpdated > INTERVAL) {
                this.lastUpdated = Date.now();
              const localEditorState = JSON.stringify(convertToRaw(this.props.editor.editorState.getCurrentContent()));
              if (localEditorState !== rawContentState) {
                console.debug('sending complete state');
                return localEditorState;
              }
              return rawContentState;
            }
        });
    }, INTERVAL);
  }

  processData = (editorState) => {
    const blockMap = editorState.getCurrentContent().getBlockMap();

    if ((this.lastBlockMap && this.lastBlockMap.hashCode()) !== blockMap.hashCode()) {
      const { uid, blocksCount } = this.props.editor;
      const raw = convertToRaw(editorState.getCurrentContent());
      const newBlocksCount = getCountChange(uid, blocksCount, blockMap, this.lastBlockMap);
      this.props.setPage(editorState, this.props.editor.pageName, raw, newBlocksCount, this.props.editor.uid, blockMap.hashCode());
      this.lastBlockMap = blockMap;
    }
  }

  lastCommited = new OrderedMap({});

  getArrayBlockMap = (blockMap, toDelete) =>
      blockMap.keySeq().toArray().map((key) => ({
        key,
        text: blockMap.get(key).getText(),
        hashCode: blockMap.get(key).hashCode(),
      }))
      .concat(toDelete.map(key => ({
        key,
        text: '',
        hashCode: DELETE,
      })));

  sendData = (editorState) => {
    const currentContent = editorState.getCurrentContent();

    if (this.lastCommited.hashCode() === currentContent.getBlockMap().hashCode()) return;
    const toDelete = Array.from(this.lastCommited.keySeq()).filter(key =>
      !currentContent.getBlockForKey(key));

    this.lastCommited = currentContent.getBlockMap();

    const arrayBlockMap = this.getArrayBlockMap(currentContent.getBlockMap(), toDelete);
    const fireRef = this.props.firebase.database.ref(`data/${this.props.editor.pageName}/current/blocksCount`);

    fireRef.transaction((liveBlock) => {
      if (!liveBlock) liveBlock = {};
      arrayBlockMap.forEach((block) => {
        if (liveBlock[block.key]) {
          if (block.hashCode === liveBlock[block.key].lastHashCode
          && liveBlock[block.key].modifiedBy !== this.props.editor.uid) {
            console.log('prevented duplicacy', block.key, block.hashCode);
            return;
          }
        }
        if (!liveBlock[block.key]) {
          liveBlock[block.key] = {};
          liveBlock[block.key].hashCode = -2;
          liveBlock[block.key].lastHashCode = -1;
          liveBlock[block.key].count = 0;
        }
        if (liveBlock[block.key].hashCode !== block.hashCode) {
          liveBlock[block.key] = {
            ...liveBlock[block.key],
            ...block,
            modifiedBy: this.props.editor.uid,
            lastHashCode: liveBlock[block.key].hashCode || -1,
            count: liveBlock[block.key] + 1,
          };
        }
      });
      return liveBlock;
    }, (e, committed, snapshot) => {
      if (e) {
        console.error('failed to transact');
        return;
      }
      if (committed) {
        this.lastCommited = currentContent.getBlockMap();
        console.debug('committed');
        this.props.saveData(snapshot.val(), editorState);
      }
    });
  }

  render() {
    return (
      <div style={{ margin: '0 10px', height: '100%' }} onClick={this.focus}>
        {this.props.editor.contentState ?
          <Editor
            lastEditorState={this.props.editor.lastEditorState}
            pageName={this.props.editor.pageName}
            contentState={this.props.editor.contentState}
            firebase={this.props.firebase.database}
            placeholder="Enter some text..."
            ref="editor"
          />
        : null}
      </div>
    );
  }
}
