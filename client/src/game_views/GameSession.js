import React, { Component } from 'react';
import { connect } from 'react-redux';
import GameView from './GameView.js';
import SetUpView from './SetUpView.js';

class GameSessionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 'setup'
    }
  }

  componentDidMount() {
    const socket = require('../socket.js');

    socket.on('enter game', () => {
      console.log('match begin')
      this.setState({
        phase: 'game'
      })
    })
  }

  render() {
    var view;

    console.log(this.state.phase)

    switch (this.state.phase) {
      case 'setup':
        console.log("setupview")
        view = <SetUpView/>
        break;
      case 'game':
        view = <GameView username={this.props.username}/>
        break;
    }
    return(
      <div>
        {view}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    username: state.username
  }
}

const GameSession = connect(mapStateToProps, null)(GameSessionView)

export default GameSession;
