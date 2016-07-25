import { EditorState, convertFromRaw, Modifier , ContentState, ContentBlock} from 'draft-js';
import {  OrderedMap, List } from 'immutable';
// console.log(Modifier);
import {
  REQ_PAGE,
  REC_PAGE,
  REQ_SET_PAGE,
  REC_SET_PAGE,
} from './editor.actions';

import { getPageName } from '../helpers';

const initialState = {
  pageName: getPageName(),
  editorState: EditorState.createEmpty(),
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
      // window.x = new ContentBlock(JSON.parse(action.blockMap)[0]);
      // const contentBlockArray = JSON.parse(action.blockMap).map(
      //   c => new ContentBlock({
      //     ...c,
      //     characterList: new List(c.characterList),
      //   })
      // );

      // console.log(Map(JSON.parse(action.blockMap)).toSeq());
      // console.log(Modifier);
      // const contentState = Modifier.setBlockData(
      //   state.editorState.getCurrentContent(),
      //   state.editorState.getSelection(),
      //   contentBlockArray
      // );
      // console.log(contentState.getBlockMap().toJS());
      // console.log(state.editorState.getCurrentContent().get('blockMap'));
      // console.log(contentBlockArray);

      // const con/tentState = ContentState.createFromBlockArray(contentBlockArray);
      // window.c = contentBlockArray[0];
      // const editorState = EditorState.createWithContent(
      //   contentState,
      // );
      return {
        ...state,
        pageName: getPageName(),
        loading: false,
        // rawDraftContentState: JSON.parse(action.rawDraftContentState) || null,
        // editorState,
      };
    }
    case REQ_SET_PAGE:
      return {
        ...state,
        requesting: true,
      };
    case REC_SET_PAGE:
      return {
        ...state,
        requesting: false,
      };
    default:
      return state;
  }
}
