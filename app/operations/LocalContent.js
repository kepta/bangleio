import { replaceLine, removeLine, insertLine } from '../helpers';

const UPDATE = 'UPDATE';
const EXPIRE = '2000';

export default class LocalContent {

  constructor(pageName, getEditorState, setContentState, firebase) {
    this.pageName = pageName;
    this.getEditorState = getEditorState;
    this.setContentState = setContentState;
    this.blockMap = new Map();
    this.networkQueue = new Map();
    this.firebase = firebase;
    this.watchFirebase();
  }

  // -private
  watchFirebase = () => {
    this.firebase.ref(`data/${this.pageName}/current/blocksCount`).on('child_changed', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      this.onNetworkBlockChange(data);
    });
    this.firebase.ref(`data/${this.pageName}/current/blocksCount`).on('child_added', (snapshot) => {
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
    if (!withNetwork) {
      if (this.addToNetworkQueue(block, UPDATE)) {
        this.blockMap.set(block.key, block);
      }
    }
  }

  // gets a debounce call whenever editorState changes
  syncEditorState = (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const keySeq = Array.from(currentContent.getBlockMap().keySeq());
    function createBlock(block, count) {
      return {
        count,
        key: block.getKey(),
        text: block.getText(),
        hashCode: block.hashCode(),
        parent: keySeq.slice(0, keySeq.indexOf(block.getKey()) + 1),
      };
    }
    const editorArrayBlockMap = currentContent.getArrayBlockMap();
    editorArrayBlockMap.forEach(block => {
      const oldBlock = this.blockMap.get(block.getKey());
      if (!this.blockMap.get(block.getKey())) {
        this.updateEntry(createBlock(block, 0), true, false);
      }
      if (block.hashCode() !== oldBlock.hashCode) {
        this.updateEntry(createBlock(block, oldBlock.count), true, false);
      }
    });
  }

  addToNetworkQueue = (block) => {
    if (this.networkQueue.get(block.key)
    && this.networkQueue.get(block.key).block.hashCode === block.hashCode) {
      console.log('already sent', block.key);
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
      if (!item.block.count) {
        item.count = 0;
      }
      if (!networkBlock) {
        return item;
      }
      if (item.block.count + 1 > networkBlock.count) {
        item.count += 1;
        return item;
      }
      if (item.block.count + 1 <= networkBlock.count) {
        return;
      }
    }, (error, committed, snapshot) => {
      if (error) {
        console.error('Transaction failed abnormally!', error);

        this.onNetworkBlockChange(this.networkQueue.get(key).block);
      } else if (!committed) {
        console.log('transaction aborted as count existed', snapshot.val());

        this.networkQueue.delete(key);
        this.onNetworkBlockChange(snapshot.val());
      } else {
        this.networkQueue.delete(key);
        console.log('timer stared', key);
        this.networkQueue.get(key).timer = setTimeout(() => {
          this.networkQueue.delete(key);
          console.log('updated', key, 'succesfully');
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
