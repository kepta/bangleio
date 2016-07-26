
// this function assumes arrays would have a key
// and the order of keys will be maintained
// in case both arrays have element with same key
// what to do
// A -> local copy
// B -> network copy

// insert an item from B to A
export function insertToArray(item, key, array) {
  // push it to the last
  for (let i = 0; i < array.length; i++) {
    if (array[i].key === key) {
      return array.splice(i + 1, 0, item);
    }
  }
  return array.push(item);
}

export function replaceInArray(item, key, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].key === key) {
      array[i] = item;
      return;
    }
  }
}

export function removeItem(key, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].key === key) {
      return array.splice(i, 1);
    }
  }
  return null;
}

export function findLastCommonParent(pos, keysA, keysB) {
  let posCopy = pos;
  while (posCopy !== -1) {
    const parentKey = keysB[posCopy];
    if (keysA.indexOf(parentKey) !== -1) return parentKey;
    posCopy--;
  }
  return -1;
}

export function mergeArray(A, B, foo) {
  const keysA = A.map(a => a.key);
  const keysB = B.map(b => b.key);
  const merge = A.slice(0);
  keysB.forEach((kp, p) => {
    const i = keysB.length - 1 - p;
    const kb = keysB[i];
    const pos = keysA.indexOf(kb);
    if (pos === -1) {
      const lastCommonParent = findLastCommonParent(i - 1, keysA, keysB);
      insertToArray(B[i], lastCommonParent, merge);
    } else {
      const disputedItem = foo(A[pos], B[i]);
      if (disputedItem === -1) {
        removeItem(kb, merge);
      } else {
        replaceInArray(disputedItem, kb, merge);
      }
    }
  });
  return merge;
}
