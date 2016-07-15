import React from 'react';
import Content from './content';
import History from './history';

export default class App extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  render() {
    return (
      <div className="title-bar">
        <h1> Bangle.IO </h1>
        <h4> Your custom data storage and modification arena </h4>
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
