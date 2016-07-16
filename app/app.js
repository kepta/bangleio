import React from 'react';
import Content from './Content';
import History from './History';
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
          <div className="col-md-8">
            <Content database={this.props.database} />
          </div>
          <div className="col-md-4">
            <History database={this.props.database} />
          </div>
        </div>
      </div>
    );
  }
}
