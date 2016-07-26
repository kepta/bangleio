import { OrderedMap } from 'immutable';

export function getCountChange(uid, oldBlocksCount = {}, newBlocks, oldBlocks = new OrderedMap()) {
  const count = oldBlocksCount;
  Object.keys(oldBlocksCount).forEach(key => {
    if (!newBlocks.get(key)) {
      count[key] = -1;
    }
  });
  newBlocks.keySeq().toArray().forEach(key => {
    if (!count[key]) {
      count[key] = {
        times: 1,
        hash: newBlocks.get(key).hashCode(),
        lastModifiedBy: uid,
        text: newBlocks.get(key).getText(),
      };
    } else if (newBlocks.get(key).hashCode() !== count[key].hash) {
      count[key] = {
        times: count[key].times + 1,
        hash: newBlocks.get(key).hashCode(),
        lastModifiedBy: uid,
        text: newBlocks.get(key).getText(),
      };
    }
  });
  return count;
}
