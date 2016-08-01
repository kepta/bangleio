import { FIREBASE_URL } from '../const';

export function getPage(url) {
  return fetch(`${FIREBASE_URL}/data/${url}.json`)
          .then((resp) => resp.json());
}

export function getHistoryByPage(page) {
  return fetch(`${FIREBASE_URL}/data/${page}/history.json`).then((resp) => resp.json());
}
