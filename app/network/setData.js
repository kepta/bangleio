import { FIREBASE_URL } from '../const';
import { convertToRaw } from 'draft-js';
const THRESHOLD = 1000;

function debounce(func, wait, immediate) {
  let timeout;
  return function foo(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

export function setCurrentPage(path, currentContent, timeStamp) {
  fetch(`${FIREBASE_URL}/data/${path}/current.json`, {
    method: 'put',
    body: JSON.stringify({
      editorState: JSON.stringify(convertToRaw(currentContent)),
      timeStamp,
    }),
  });
}

export const setCurrentPageThrottled = debounce(setCurrentPage, THRESHOLD, false);
