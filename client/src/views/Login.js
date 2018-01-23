import React, { Component } from 'react';
import { connect } from 'react-redux';
import AlertContainer from 'react-alert';
import { setUserName, enterLobby } from '../actions';
import socket from '../socket.js'; 

class LoginView extends Component {
  constructor(props) {
		super(props);

		this.state = {
			username: '',
			status: 'Enter your username. No spaces or punctuation marks allowed',
		}

		this.handleResult = this.handleResult.bind(this); 
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	handleResult(result) {
		if (result.valid) {
			this.setState({status: result.msg}, function() {
				this.props.setUserName(this.state.username);
			})
		} else {
			this.setState({
				username: '', 
				status: result.msg
			})
		}
	}

	onSubmit(event) {
		event.preventDefault();
		socket.connect();
		var username = this.state.username;
		if (username.includes(' ') || username.includes('.') ||
				username.includes(',') || username.includes('?') ||
				username.includes('!')) {
			this.setState({
				username: '',
				status: 'Punctuation marks are not allowed.'
			})
		}
		else {
			socket.emit('client submit username', username);
			socket.on('server signin status', (result) => {
				this.handleResult(result);
			})
		}
	}

	onChange(event) {
		this.setState({
			username: event.target.value
		})
	}

	componentDidMount() {
	}

	render() {
		return (
			<div>
				<form onSubmit={this.onSubmit} styles={{height: '50%'}}>
					<input type="text" value={this.state.username} onChange={this.onChange}/>
					<input type="submit" value="submit"/>
				</form>
				<h1>{this.state.status}</h1>
			</div>
		)
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setUserName: username => {
			dispatch(setUserName(username))
		},
		enterLobby: () => {
			dispatch(enterLobby())
		}
	}
}

const Login = connect(
	null,
	mapDispatchToProps
)(LoginView);

export default Login;