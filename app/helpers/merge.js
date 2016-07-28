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

function processReplace(toReplace, contentState) {
  let localContentState = contentState;
  Object.keys(toReplace).forEach((key) => {
    localContentState = Modifier.replaceText(
      localContentState,
      makeSelection(0, contentState.getBlockForKey(key).getLength(), key),
      toReplace[key].text
    );
  });
  return localContentState;
}

function processRemove(toRemove, contentStates) {
  let localContentState = contentStates;
  Object.keys(toRemove).forEach((key) => {
    localContentState = Modifier.removeRange(
      localContentState,
      SelectionState.createEmpty(localContentState.getBlockBefore(key).getKey()).merge({
        anchorOffset: localContentState.getBlockBefore(key).getLength(),
        focusKey: key,
        focusOffset: localContentState.getBlockForKey(key).getLength(),
      }),
      'forward'
    );
  });
  return localContentState;
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
