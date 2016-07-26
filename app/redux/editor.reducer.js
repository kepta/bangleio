import { EditorState, convertFromRaw, Modifier, ContentState, ContentBlock } from 'draft-js';
import { OrderedMap, List } from 'immutable';
// console.log(Modifier);
import {
  REQ_PAGE,
  REC_PAGE,
  REQ_SET_PAGE,
  REC_SET_PAGE,
  CREATE_DIFF,
  REMOVE_DIFF,
} from './editor.actions';

import { getPageName } from '../helpers';

const initialState = {
  timeStamp: 0,
  pageName: getPageName(),
  uid: btoa(Math.floor(Math.random() * 100000) + Date.now()),
};

export default function feature(state = initialState, action) {
  switch (action.type) {

    case REQ_PAGE:
      return {
        ...state,
        pageName: getPageName(),
        loading: true,
      };

    case REC_PAGE: {
      if (!action.contentState) {
        return {
          ...state,
          pageName: getPageName(),
          loading: false,
          contentState: 'blank',
          blocksCount: [],
          timeStamp: 0,
        };
      }
      return {
        ...state,
        pageName: getPageName(),
        loading: false,
        contentState: JSON.parse(action.contentState),
        blocksCount: action.blocksCount,
        timeStamp: action.timeStamp,
      };
    }

    case REQ_SET_PAGE:
      return {
        ...state,
        requesting: true,
        blocksCount: action.blocksCount,
        lastEditorState: action.lastEditorState,
        hashCode: action.hashCode,
      };

    case REC_SET_PAGE:
      return {
        ...state,
        requesting: false,
        blocksCount: action.blocksCount,
        contentState: JSON.parse(action.contentState),
        timeStamp: action.timeStamp,
      };

    case CREATE_DIFF:
      return {
        ...state,
        pendingDiff: action.diff,
      };

    case REMOVE_DIFF:
      return {
        ...state,
        pendingDiff: null,
      };
    default:
      return state;
  }
}
