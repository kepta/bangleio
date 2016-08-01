import { FIREBASE_URL } from '../const';
import { convertToRaw } from 'draft-js';
import { database } from 'firebase';

export function setPage(path, data) {
  return fetch(`${FIREBASE_URL}/data/${path}.json`, {
    method: 'put',
    body: JSON.stringify({
      ...data,
      timeStamp: database.ServerValue.TIMESTAMP,
    }),
  })
  .then((d) => d.json());
}

export function updateHistory(pn, currentContent, database) {
  console.log('History update');
  return database.ref(`data/${pn}`).child('history').push({
    editorState: JSON.stringify(convertToRaw(currentContent)),
    timeStamp: database.ServerValue.TIMESTAMP,
  });
}

// export const setCurrentPageThrottled = debounce(setCurrentPage, THRESHOLD, false);
