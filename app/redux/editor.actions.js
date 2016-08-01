export const REQ_PAGE = 'REQ_PAGE';
export const REC_PAGE = 'REC_PAGE';
export const REC_PAGE_ERROR = 'REC_PAGE_ERROR';

export const REQ_SET_PAGE = 'REQ_SET_PAGE';
export const REC_SET_PAGE = 'REC_SET_PAGE';

export const CREATE_DIFF = 'CREATE_DIFF';
export const REMOVE_DIFF = 'REMOVE_DIFF';

export const SAVE_DATA = 'SAVE_DATA';
export const SAVE_CONTENTSTATE = 'SAVE_CONTENTSTATE';

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

export function reqSetPage(lastEditorState, blocksCount, hashCode) {
  return {
    type: REQ_SET_PAGE,
    blocksCount,
    lastEditorState,
    hashCode
  };
}

export function recSetPage(d) {
  return {
    type: REC_SET_PAGE,
    ...d,
  };
}

export function createDiff(diff) {
  return {
    type: CREATE_DIFF,
    diff,
  };
}

export function removeDiff() {
  return {
    type: REMOVE_DIFF,
  };
}

export function saveData(blockMap, editorState) {
  return {
    type: SAVE_DATA,
    blockMap,
    editorState,
  };
}

export function saveContentState(contentState) {
  return {
    type: SAVE_CONTENTSTATE,
    contentState,
  };
}

export function setPage(lastEditorState, path, rawContentState, blocksCount, uid, hashCode) {
  return dispatch => {
    dispatch(reqSetPage(lastEditorState, blocksCount, hashCode));
    return setPageNetwork(path, { contentState: JSON.stringify(rawContentState), blocksCount, uid, hashCode })
      .then((d) => dispatch(recSetPage(d)));
  };
}
