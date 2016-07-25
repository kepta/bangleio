import React from 'react';
import Content from './Content';
import TitleBar from './TitleBar';


export default class App extends React.Component {
  render() {
    return (
      <div className="title-bar">
        <TitleBar />
        <br />
        <div className="row">
          <div>
            <Content />
          </div>
        </div>
      </div>
    );
  }
}
