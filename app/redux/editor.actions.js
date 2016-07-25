export const REQ_PAGE = 'REQ_PAGE';
export const REC_PAGE = 'REC_PAGE';
export const REC_PAGE_ERROR = 'REC_PAGE_ERROR';

export const REQ_SET_PAGE = 'REQ_SET_PAGE';
export const REC_SET_PAGE = 'REC_SET_PAGE';

import { getPage as getPageNetwork } from '../network/getData';
import { setPage as setPageNetwork } from '../network/setData';

function reqPage() {
  return {
    type: REQ_PAGE,
  };
}

export function recPage(page) {
  console.log(page);
  return {
    type: REC_PAGE,
    ...page,
  };
}

function recPageError(error) {
  return {
    type: REC_PAGE_ERROR,
    error,
  };
}


export function getPage(pageName) {
  return dispatch => {
    dispatch(reqPage);
    return getPageNetwork(pageName)
      .then((data) => dispatch(recPage(data)))
      .catch((e) => dispatch(recPageError(e)));
  };
}

export function reqSetPage(content) {
  return {
    type: REQ_SET_PAGE,
    content,
  };
}

export function recSetPage(d) {
  return {
    type: REC_SET_PAGE,
    data: d,
  };
}

export function setPage(path, rawDraftContentState) {
  return dispatch => {
    dispatch(reqSetPage(rawDraftContentState));
    return setPageNetwork(path, { rawDraftContentState : JSON.stringify(rawDraftContentState) })
      .then((d) => dispatch(recSetPage(d)));
  };
  // return dispatch => {
  //   dispatch(reqSetPage(data));
  //   return setPageNetwork(path, data)
  //     .then((d) => dispatch(recSetPage(d)));
  // };
}
