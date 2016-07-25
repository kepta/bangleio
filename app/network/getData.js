import { FIREBASE_URL } from '../const';

export function getPage(page) {
  return fetch(`${FIREBASE_URL}/data/${page}/current.json`)
          .then((resp) => resp.json());
}

export function getHistoryByPage(page) {
  return fetch(`${FIREBASE_URL}/data/${page}/history.json`).then((resp) => resp.json());
}
