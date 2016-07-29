import { OrderedMap } from 'immutable';

export function difference(editorState, networkBlockMap = {}) {
  const blockMap = editorState.getCurrentContent().getBlockMap();
  const diff = blockMap.keySeq().toArray().map((key, index) => {
    if (!networkBlockMap[key] || (networkBlockMap[key].hashCode !== blockMap.get(key).hashCode())) {
      return {
        key,
        text: blockMap.get(key).getText(),
        hashCode: blockMap.get(key).hashCode(),
      };
    }
    return networkBlockMap[key];
  });

  const deleted = Object.keys(networkBlockMap).filter(key => !blockMap.get(key));

  return { diff, deleted };
}
