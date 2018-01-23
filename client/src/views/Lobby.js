import React, { Component } from 'react';
import ListItem from '../components/ListItem.js';
import Invitation from '../components/Invitation'
import _ from 'lodash';
import { connect } from 'react-redux';
import AlertContainer from 'react-alert';
import { enterGame, enterLobby } from '../actions';
import ReactList from 'react-list';
import socket from '../socket.js';


class LobbyView extends Component {
  constructor(props) {
		super(props);

		this.state = {
			users: '',
		}

    this.onInvite = this.onInvite.bind(this); 
    this.onInvResponse = this.onInvResponse.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
    console.log('In Lobby');
    console.log('socket connected: ', socket.connected);

    socket.emit('client enter lobby');

    socket.on('server lobby update', (users) => {
      console.log('get playerbase')
      var userList = [];
      _.forEach(users, function(user){
        userList.push({id: user.id, status: user.status})
      })
      this.setState({ users: userList })
    });


    socket.on('server invitation response status', (msg) => {
      this.msg.show(msg)
    })

    socket.on('server invitation request status', (msg) => {
      this.msg.show(msg)
    })

    socket.on('incoming invitation', (sender) => {
      console.log('From: ', sender);
      this.msg.show(
        <Invitation sender={sender} onClick={this.onInvResponse}/>, 
        {
          time: 0
        })
    })

    socket.on('server notify start', (msg) => {
      this.msg.show(msg);
    })
  }

  onInvite(targetUser) {
    console.log('invite sent')
    socket.emit('client invitation request', targetUser);
  }

  onInvResponse(accept, inviteFrom) {
    var res = {inviteFrom: inviteFrom, reject: true}

    if (accept)
      res.reject = false;
    
    socket.emit('client invitation response', res);
  }

  renderItem(index, key) {
    console.log('rendering item')
    return(
      <div key={key}>
        <ListItem
          user={this.state.users[index]}
          onInvite={this.onInvite}
        />
      </div>
    )
  }
	

	render() {

    const alertOptions = {
      position: 'top left',
      theme: 'light',
      time: 2000,
    }

		return (
      <div className="lobby">
        <AlertContainer ref={a => this.msg = a} {...alertOptions}/>
        <div className="users-list">
          <ReactList
            itemRenderer={this.renderItem}
            length={this.state.users.length}
            type='uniform'
          />
        </div>
			</div>
		)
	}
}

const mapDispatchToProps = dispatch => {
	return {
		enterGame: () => {
			dispatch(enterGame())
    },
    
	}
}

const Lobby = connect(
	null,
	mapDispatchToProps
)(LobbyView);

export default Lobby;
