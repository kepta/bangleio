export const REQ_CURRENT_PAGE = 'REQ_CURRENT_PAGE';
export const REC_CURRENT_PAGE = 'REC_CURRENT_PAGE';
export const REC_CURRENT_PAGE_ERROR = 'REC_CURRENT_PAGE_ERROR';

export const REQ_SET_CURRENT_PAGE = 'REQ_SET_CURRENT_PAGE';
export const REC_SET_CURRENT_PAGE = 'REC_SET_CURRENT_PAGE';

import { getCurrentPage as getCurrentPageNetwork } from '../network/getData';
import { setCurrentPage as setCurrentPageNetwork } from '../network/setData';

function reqCurrentPage() {
  return {
    type: REQ_CURRENT_PAGE,
  };
}

export function recCurrentPage(currentPage) {
  if (!currentPage) {
    return {
      type: REC_CURRENT_PAGE,
      currentPage: {
        seed: 0,
        timeStamp: Date.now(),
      },
    };
  }
  return {
    type: REC_CURRENT_PAGE,
    currentPage,
  };
}

function recCurrentPageError(error) {
  return {
    type: REC_CURRENT_PAGE_ERROR,
    error,
  };
}


export function getCurrentPage(page) {
  return dispatch => {
    dispatch(reqCurrentPage);
    return getCurrentPageNetwork(page)
      .then((data) => dispatch(recCurrentPage(data)))
      .catch((e) => dispatch(recCurrentPageError(e)));
  };
}

export function reqSetCurrentPage(currentContent) {
  return {
    type: REQ_SET_CURRENT_PAGE,
    currentContent,
  };
}

export function recSetCurrentPage(d, seed) {
  console.log('set current page received', d);
  return {
    type: REC_SET_CURRENT_PAGE,
    data: d,
    seed,
  };
}

export function setCurrentPage(seed, path, currentContent, count) {
  return dispatch => {
    dispatch(reqSetCurrentPage(currentContent));
    return setCurrentPageNetwork(seed + 1, path, currentContent, count)
      .then((d) => dispatch(recSetCurrentPage(d, seed + 1)));
  };
}
