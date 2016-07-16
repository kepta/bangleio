import React from 'react';
import Content from './Content';
import TitleBar from './TitleBar';


export default class App extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  render() {
    return (
      <div className="title-bar">
        <TitleBar />
        <br />
        <div className="row">
          <div>
            <Content database={this.props.database} />
          </div>
        </div>
      </div>
    );
  }
}
