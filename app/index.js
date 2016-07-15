import React from 'react';
import render from 'react-dom';
import App from './app';
import './app.css';
import 'whatwg-fetch';
import firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyC__3F3crIHSstH4c8UQwJV0YRiWg_WbPI',
  authDomain: 'bangle-d53bd.firebaseapp.com',
  databaseURL: 'https://bangle-d53bd.firebaseio.com',
  storageBucket: 'bangle-d53bd.appspot.com',
};

firebase.initializeApp(config);
const database = firebase.database();

render.render(<App database={database} />, document.getElementById('app'));
