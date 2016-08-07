import { replaceLine, removeLine, insertLine } from '../helpers';
import { convertToRaw } from 'draft-js';
const UPDATE = 'UPDATE';
const EXPIRE = 1700;
const POLL = 3000;
export default class LocalContent {

  constructor(pageName, getEditorState, setContentState, firebase) {
    this.pageName = pageName;
    this.getEditorState = getEditorState;
    this.setContentState = setContentState;
    this.editorState = undefined;
    this.blockMap = new Map();
    this.networkQueue = new Map();
    this.firebase = firebase;
    this.watchFirebase();
    this.sendRawContentBlock();
  }

  // -private

  sendRawContentBlock = () => {
    setInterval(() => {
      if (!this.editorState) return;
      const raw = convertToRaw(this.editorState.getCurrentContent());
      // console.log('sending complete state');
      this.firebase.ref(`data/${this.pageName}/current/contentState`)
        .set(JSON.stringify(raw));
    }, POLL);
  }
  watchFirebase = () => {
    this.firebase.ref(`data/${this.pageName}/current/blocksMap`).on('child_changed', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      this.onNetworkBlockChange(data);
    });
    this.firebase.ref(`data/${this.pageName}/current/blocksMap`).on('child_added', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      this.onNetworkBlockChange(data);
    });
  }

  // updates a block in the this.blockMap and decides
  // whether to call network or editor for change
  updateEntry = (_block, withEditor, withNetwork) => {
    const block = _block;
    if (!withEditor) {
      this.updateEditorState(block);
      this.blockMap.set(block.key, block);
    }
    if (!withNetwork && this.addToNetworkQueue(block, UPDATE)) {
      this.blockMap.set(block.key, block);
    }
  }

  // gets a debounce call whenever editorState changes
  syncEditorState = (editorState) => {
    if (this.editorState) {
      if (this.editorState.getCurrentContent().hashCode() === editorState.getCurrentContent().hashCode()) {
        return;
      }
    }
    this.editorState = editorState;
    const currentContent = editorState.getCurrentContent();
    const keySeq = Array.from(currentContent.getBlockMap().keySeq());
    function createBlock(block, count) {
      return {
        count,
        key: block.getKey(),
        text: block.getText(),
        hashCode: block.hashCode(),
        ancestors: keySeq.slice(0, keySeq.indexOf(block.getKey()) + 1),
        deleted: false,
      };
    }
    const editorArrayBlockMap = currentContent.getBlocksAsArray();
    this.blockMap.forEach(block => {
      if (!currentContent.getBlockForKey(block.key)) {
        block.deleted = true;
        block.hashCode = 'DELETED';
        this.updateEntry(block, true, false);
      }
    });
    editorArrayBlockMap.forEach(block => {
      const oldBlock = this.blockMap.get(block.getKey());
      // console.log(block.key, oldBlock);
      // console.log(this.blockMap);
      if (!oldBlock) {
        console.log('creating new block', block.key, block.text);
        this.updateEntry(createBlock(block, 0), true, false);
        return;
      }
      if (block.hashCode() !== oldBlock.hashCode) {
        this.updateEntry(createBlock(block, oldBlock.count), true, false);
      }
    });
  }

  addToNetworkQueue = (block) => {
    if (this.networkQueue.get(block.key)
    && this.networkQueue.get(block.key).block.hashCode === block.hashCode) {
      // console.log('already sent', block.key);
      return false;
    }
    if (this.networkQueue.get(block.key) &&
      this.networkQueue.get(block.key).timer) {
      console.log('timer erased', block.key);
      clearTimeout(this.networkQueue.get(block.key).timer);
    }
    this.networkQueue.set(block.key, {
      block,
      timeStamp: Date.now(),
    });
    this.sendToNetwork(block.key);
    return true;
  }

  sendToNetwork = (key) => {
    const fireRef = this.firebase.ref(`data/${this.pageName}/current/blocksMap/${key}`);
    fireRef.transaction((networkBlock) => {
      const item = this.networkQueue.get(key).block;
      if (!item) return;
      // //console.log(key);
      // //console.log(this.networkQueue);
      window.networkQueue = this.networkQueue;
      // console.log(item, key);
      if (!networkBlock) {
        return item;
      }
      if (item.count + 1 > networkBlock.count) {
        item.count += 1;
        return item;
      }
      if (item.count + 1 <= networkBlock.count) {
        return;
      }
    }, (error, committed, snapshot) => {
      if (error) {
        console.error('Transaction failed abnormally!', error);

        this.onNetworkBlockChange(this.networkQueue.get(key).block);
      } else if (!committed) {
        // console.log('transaction aborted as count existed snap', snapshot.val(), this.networkQueue.get(key).block);
        this.networkQueue.delete(key);
        this.onNetworkBlockChange(snapshot.val());
      } else {
        // console.log('timer stared', key);
        this.networkQueue.get(key).timer = setTimeout(() => {
          // console.log('updated', key, 'succesfully', this.networkQueue.get(key).block.text);
          this.networkQueue.delete(key);
        }, EXPIRE);
      }
    });
  }
  // editor related functions


  // calls the necessary helper functions to
  // update currentContent
  updateEditorState = (block) => {
    let contentState = this.getEditorState().getCurrentContent();
    if (!this.blockMap.get(block.key)) {
      // creating a new block
      contentState = insertLine(block, block.ancestors, contentState);
    } else if (!contentState.getBlockForKey(block.key)) {
      return;
    } else if (block.deleted === true) {
      contentState = removeLine(contentState, block.key);
    } else {
      contentState = replaceLine(contentState, block.key, block.text);
    }
    this.setContentState(contentState);
  }


  // comes from network
  onNetworkBlockChange = (block) => {
    if (!block) return;

    const localBlock = this.blockMap.get(block.key);

    if (!localBlock) {
      this.updateEntry(block, false, true);
      return;
    }
    if (block.deleted && localBlock.deleted) {
      return;
    }
    if (block.count > localBlock.count) {
      this.updateEntry(block, block.hashCode === localBlock.hashCode, true);
      return;
    }
    if (block.count === localBlock.count && block.hashCode !== localBlock.hashCode) {
      // in case count is same, both the user have applied the logic
      // let the network block rule over local block
      this.updateEntry(block, false, true);
      return;
    }
    if (block.count <= localBlock.count) {
      // to remember we sent data
      this.updateEntry(localBlock, true, false);
      return;
    }
  }
}
