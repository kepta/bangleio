import React from 'react';

const style = {
  wrapper: {
    display: 'flex',
    backgroundColor: '#3B3738',
    color: 'white',
    position: 'fixed',
    top: 0,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
    fontFamily: 'Helvetica',
  },
  bangle: {
    fontSize: '1.5em',
  },
};

export default () => (
  <div style={style.wrapper}>
    <h1 style={style.bangle}>Bangle.io</h1>
  </div>
);
