import { FIREBASE_URL } from '../const';

export function getCurrentPage(page) {
  return fetch(`${FIREBASE_URL}/data/${page}/current.json`)
          .then((resp) => resp.json());
}