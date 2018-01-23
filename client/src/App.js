import React, { Component } from 'react';
import logo from './logo.svg';
import GameSession from './game_views/GameSession.js';
import Lobby from './views/Lobby.js';
import Login from './views/Login.js';
//import Header from './Header.js';
import { connect } from 'react-redux';
import { clearUserName, enterGame, enterLobby } from './actions';
import socket from './socket.js';
import './App.css';


class AppView extends Component {

	constructor(props) {
		super(props)
	}

	componentDidMount() {
		
		if (this.props.status == 'offline')
			socket.emit('client disconnecting');
			socket.close(); 
			this.props.clearUserName();

		socket.on('load lobby view', () => {
			this.props.enterLobby();
		});

		socket.on('load game view', () => { 
			this.props.enterGame();
		})
	}

	componentWillUnmount() {
		console.log('unmounting')
		socket.emit('client disconnect');
	}

  render() {
		var view;
		console.log(this.props.status);
  	switch (this.props.status) {
  		case 'offline':
  			view = <Login/>;
  			break;
  		case 'lobby':
  			view = <Lobby/>;
  			break;
  		case 'game':
  			view = <GameSession/>;
  	}
    return (
    	<div>
	      {view}
	    </div>
    );
  }
}

const mapStateToProps = state => {
	return {
		status: state.status
	}
}

const mapDispatchToProps = dispatch => {
	return {
		enterLobby: () => {
			dispatch(enterLobby())
		},
		enterGame: () => {
			dispatch(enterGame())
		},
		clearUserName: () => {
			dispatch(clearUserName())
		}
	}
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppView)

export default App;
