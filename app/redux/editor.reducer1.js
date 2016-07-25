import {
  REQ_CURRENT_PAGE,
  REC_CURRENT_PAGE,
  REQ_SET_CURRENT_PAGE,
  REC_SET_CURRENT_PAGE,
} from './editor.actions';
import { EditorState, convertFromRaw, SelectionState } from 'draft-js';

let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}

const initialState = {
  page: pn,
  currentPage: null,
  networkTimeStamp: 0,
  seed: 0,
  seedMap: new Map(),
  loading: false,
  requesting: false,
  editorState: EditorState.createEmpty(),
};

function updateEditor(newContent, editorState) {
  if (newContent && newContent.editorState) {
    const currentSelectionKey = editorState.getSelection().getFocusKey();
    const currentSelectionOffset = editorState.getSelection().getFocusOffset();

    let newEditorState = EditorState.push(
      editorState,
      convertFromRaw(JSON.parse(newContent.editorState)),
      'change-block-data'
    );

    const selectionState = SelectionState.createEmpty(currentSelectionKey);
    const updatedSelection = selectionState.merge({
      focusKey: currentSelectionKey,
      focusOffset: currentSelectionOffset,
      anchorOffset: currentSelectionOffset,
    });

    newEditorState = EditorState.acceptSelection(
      newEditorState,
      updatedSelection,
    );

    // const newContentState = newEditorState.getCurrentContent();
    // printData(newContentState, '59qnh');
    // printData(currentContentState, '59qnh');
    // printData(newContentState, newEditorState.getSelection().getFocusKey());
    // this.setState({
    //   editorState: newEditorState,
    //   timeStamp: content.timeStamp,
    // });
    return newEditorState;
  }
  return editorState;
}

export default function feature(state = initialState, action) {
  switch (action.type) {
    case REQ_CURRENT_PAGE:
      return {
        ...state,
        loading: true,
      };
    case REC_CURRENT_PAGE:
      return {
        ...state,
        loading: false,
        currentPage: action.currentPage,
        seed: action.currentPage.seed || 0,
        networkTimeStamp: action.currentPage.timeStamp,
        editorState: updateEditor(action.currentPage, state.editorState),
      };
    case REQ_SET_CURRENT_PAGE:
      return {
        ...state,
        requesting: true,
        editorState: EditorState.push(
          state.editorState,
          action.contentState,
          'change-block-data'
        ),
      };
    case REC_SET_CURRENT_PAGE: {
      console.log(action.data && action.data.timeStamp);
      state.seedMap.set(action.seed, true);
      return {
        ...state,
        requesting: false,
        seed: action.seed || 0,
        networkTimeStamp: action.data.timeStamp,
      };
    }
    default:
      return state;
  }
}
