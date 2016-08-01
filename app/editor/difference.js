export const arrayBlockMap = (blockMap) =>
    blockMap.keySeq().toArray().map((key) => ({
      key,
      text: blockMap.get(key).getText(),
      hashCode: blockMap.get(key).hashCode(),
    }));
