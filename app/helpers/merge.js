import { ContentBlock, CharacterMetadata, Modifier, SelectionState } from 'draft-js';
import { Repeat, List, OrderedMap } from 'immutable';
// this function assumes arrays would have a key
// and the order of keys will be maintained
// in case both arrays have element with same key
// what to do
// A -> local copy
// B -> network copy

// insert an item from B to A

const charData = CharacterMetadata.create();

function createContentBlock(key, text) {
  return new ContentBlock({
    key,
    type: 'unstyled',
    text,
    characterList: List(Repeat(charData, text.length)),
  });
}

function createFragment(keyTextArray) {
  return keyTextArray.map(o => createContentBlock(o.key, o.text));
}

export function findLastCommonParent(pos, contentState, keysB) {
  let posCopy = pos;
  while (posCopy !== -1) {
    const parentKey = keysB[posCopy];
    if (contentState.getBlockForKey(parentKey)) return parentKey;
    posCopy--;
  }
  return '_NO_PARENT';
}

function safePush(obj, key, val) {
  if (Array.isArray(obj[key])) {
    obj[key].push(val);
  } else {
    obj[key] = [val];
  }
}

function makeSelection(start, end, key) {
  return SelectionState.createEmpty(key).merge({
    anchorOffset: 0,
    focusKey: key,
    focusOffset: end,
  });
}

export function replaceLine(contentState, key, text) {
  return Modifier.replaceText(
    contentState,
    makeSelection(0, contentState.getBlockForKey(key).getLength(), key),
    text
  );
}

export function removeLine(contentState, key) {
  return Modifier.removeRange(
    contentState,
    SelectionState.createEmpty(contentState.getBlockBefore(key).getKey()).merge({
      anchorOffset: contentState.getBlockBefore(key).getLength(),
      focusKey: key,
      focusOffset: contentState.getBlockForKey(key).getLength(),
    }),
    'forward'
  );
}

function processReplace(toReplace, contentState) {
  let localContentState = contentState;
  Object.keys(toReplace).forEach((key) => {
    localContentState = replaceLine(localContentState, key, toReplace[key].text);
  });
  return localContentState;
}

function processRemove(toRemove, contentStates) {
  let localContentState = contentStates;
  Object.keys(toRemove).forEach((key) => {
    localContentState = removeLine(localContentState, key);
  });
  return localContentState;
}

export function insertLine(block, ancestors, contentState) {
  function findLastAncestor() {
    let pos = ancestors.indexOf(block.key);
    while (pos !== -1) {
      const parentKey = ancestors[pos];
      if (contentState.getBlockForKey(parentKey)) return parentKey;
      pos--;
    }
    return '_NO_PARENT';
  }
  const lastCommonParent = findLastAncestor();
  let map = new OrderedMap();
  const oldMap = contentState.getBlockMap();
  map = map.withMutations(m => {
    Array.from(oldMap.keySeq()).forEach(k => {
      m = m.set(k, oldMap.get(k));
      if (k === lastCommonParent) {
        m = m.set(block.key, createContentBlock(block.key, block.text));
      }
    });
    if (lastCommonParent === '_NO_PARENT') {
      m = m.set(block.key, createContentBlock(block.key, block.text));
    }
  });
  return contentState.set('blockMap', map);
}

function processInsert(toInsert, newContentState) {
  let map = new OrderedMap();
  const oldMap = newContentState.getBlockMap();
  map = map.withMutations(m => {
    Array.from(oldMap.keySeq()).forEach(k => {
      m = m.set(k, oldMap.get(k));
      if (toInsert[k]) {
        toInsert[k].forEach(item => {
          m = m.set(item.key, createContentBlock(item.key, item.text));
        });
      }
    });
    if (toInsert['_NO_PARENT']) {
      toInsert['_NO_PARENT'].forEach(item => {
        m = m.set(item.key, createContentBlock(item.key, item.text));
      });
    }
  });
  return newContentState.set('blockMap', map);
}

export function insertLines(contentState, B) {
  const keysB = B.map(b => b.key);
  const toInsert = {};
  keysB.forEach((kB, i) => {
    const item = contentState.getBlockForKey(kB);
    if (!item) {
      const lastCommonParent = findLastCommonParent(i - 1, contentState, keysB);
      safePush(toInsert, lastCommonParent, B[i]);
    }
  });
  return processInsert(toInsert, contentState);
}

export function mergeContent(contentState, B, foo) {
  const keysB = B.map(b => b.key);
  const toInsert = {};
  const toReplace = {};
  const toRemove = {};
  keysB.forEach((kB, i) => {
    const item = contentState.getBlockForKey(kB);
    if (!item) {
      const lastCommonParent = findLastCommonParent(i - 1, contentState, keysB);
      safePush(toInsert, lastCommonParent, B[i]);
    } else {
      const disputedItem = foo(item, B[i]);
      if (disputedItem !== item) {
        if (!disputedItem) {
          toRemove[kB] = disputedItem;
        } else {
          toReplace[kB] = disputedItem;
        }
      }
    }
  });
  let newContentState = processReplace(toReplace, contentState);
  newContentState = processRemove(toRemove, newContentState);
  newContentState = processInsert(toInsert, newContentState);
  return newContentState;
}
