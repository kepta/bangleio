import { combineReducers } from 'redux';
import editor from './editor.reducer';
import firebase from './firebase.reducer';

export default combineReducers({ editor, firebase });
