import React from 'react';
import { getHistoryByPage } from './network/getData';

let pn = window.location.pathname;
if (pn === '/') {
  pn = 'root';
} else {
  pn = pn.slice(1);
}

export default class History extends React.Component {
  static propTypes = {
    database: React.PropTypes.object.isRequired,
  }
  state = {
    historyPanel: [],
  }
  componentWillMount() {
    // this.getHistory();
  }
  componentDidMount() {
    this.pollHistory();
  }
  getHistory = () => {
    getHistoryByPage(pn, this.props.database).then((content) => {
      console.log('JSON content', content);
      if (content) {
        this.setState({ historyPanel: content });
      }
    });
  }
  pollHistory = () => {
    console.log('Entered poll history');
    this.props.database.ref(`data/${pn}/history`).on('child_added', (update) => {
    //  console.log("Updated value",update.val());
      const newState = this.state.historyPanel;
      newState.push(update.val());
      this.setState({ historyPanel: newState });
    //  this.getHistory();
    });
  }
  render() {
    // console.log('History Panel', this.state.historyPanel);
    const historyPanel = this.state.historyPanel;
    const updateEditor = this.props.updateEditor;
    const timeStamps = historyPanel.map((value) => {
      return (<div key={value['timeStamp']}> {value['timeStamp']} <br/>
    <button onClick= {updateEditor.bind(this,value['editorState'])} > Revert </button><hr /></div>);
    });
    return (
      <div>
        <h1>Revision History</h1>
        {timeStamps}
      </div>
    );
  }
}
