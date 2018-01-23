var _ = require('lodash')
	, Session = require('./Session.js');


module.exports = function(io) {

	games = [];
	users = [];
	invitations = [];


	var findSocket = function(searchName) {
		var sockets = io.sockets.sockets;
		return _.find(sockets, {id: searchName});
	}

	var onSignIn = function(username) {
		var result = {
			msg: "",
			valid: false
		}
	
		if (!username) 
			result.msg = 'You did not enter a name.'
		else if (_.find(users, {id: username}))
			result.msg = 'Name is already taken.'
		else {
			result.msg = 'logging in...';
			result.valid = true;
		}
		return result;
	}

	var removeUser = function(socket) {	
		_.remove(users, function(user) {
			return user.id == socket.id
		}) 

		socket.disconnect('true');
		update = users;
		io.sockets.emit('server lobby update', update)
	}

	var canInvite = function(senderId, targetId) {
		var result = {valid: true, msg: ''};

		var user = _.find(users, {id: targetId})
		console.log(user.status)
		var targetSocket = findSocket(targetId);
		if (senderId == targetId) {
			result.msg = 'You cannot send an invitation to yourself'
			result.valid = false; 
		} else if (user.status == 'game') {
			result.msg = 'User is in game';
			result.valid = false;
		} else if (_.findIndex(invitations, { from: senderId, to: targetId }) != -1) {
			result.msg = 'You have already sent an invitation to this user';
			result.valid = false;
		}
		return result
	}

	var onInvitationResponse = function(res, otherSocket) {
		var result = {
			msg: '',
			pass: false,
		};

		if (!otherSocket || !otherSocket.connected) {
			result.msg = res.inviteFrom + ' is not online.';
		} else if (_.find(users, {id: otherSocket.id}).status == 'game') {
			result.msg = res.inviteFrom + ' is in game.';
		} else if (res.reject) {
			result.msg = 'You have turned down the invite from ' + otherSocket.user + '.';
		} else {
			result.msg = 'You have accepted the invite from ' + otherSocket.user + '.';
			result.pass = true;
		}
		return result;
	}

	var formNewGame = function(socket1, socket2) {
		_.find(users, {id: socket1.id}).status = 'game';
		_.find(users, {id: socket2.id}).status = 'game';

		socket1.emit('server notify start', 'Game starting soon!')
		socket2.emit('server notify start', 'Game starting soon!')
		console.log('game start')

		var game = new Session(socket1, socket2);
		games.push({user1: socket1.user, user2: socket2.user, game: game});

		setTimeout(function(){
			game.start();
		}, 2000);
 
	}

	var quitGame = function(user) {
		var active_game = _.find(games, 
			function(game) {
				return (game.user1 == user || game.user2 == user);
			})

		if (!active_game) {
			return; 
		} else {
			var game = active_game.game
			game.end();
			_.remove(games, {game: game});
		}
	}
	
	this.start = function() {
		console.log('open sockets')
		io.on('connect', function(socket) {

			console.log('new socket joined');

			socket.on('client submit username', function(username) {
				var result = onSignIn(username);
				socket.emit('server signin status', result)

				if (result.valid) {

					console.log('pass')
					socket.id = username;
					
					setTimeout(function () {
						socket.join('lobby');
						console.log('enter lobby');
						users.push({id: socket.id, status: 'lobby'});
						var update = users;
						io.sockets.emit('server lobby update', update);
						socket.emit('load lobby view');
					}, 1000);
				} 
			});

			socket.on('client enter lobby', function(){
				console.log('client entered lobby')
				var update = users;
				socket.emit('server lobby update', update)
			})

			socket.on('client invitation request', function(targetId) {
				var result = canInvite(socket.id, targetId);
				console.log('invite request processing')
				if (result.valid) {
					var targetSocket = findSocket(targetId);
					console.log('sending invite')
					targetSocket.emit('incoming invitation', socket.id)
					invitations.push({from: socket.id, to: targetId}) 
				} else {
					socket.emit('server invitation request status', result.msg)
				}
			});

			socket.on('client invitation response', function(res) {
				var otherSocket = findSocket(res.inviteFrom)
				console.log(otherSocket.id)
				result = onInvitationResponse(res, otherSocket);
				socket.emit('server invitation response status', result.msg)

				if (result.pass) {
					console.log('hellyah')
					otherSocket.emit('server invitation request status', socket.id + ' has accepted your invite');

					formNewGame(socket, otherSocket);

					update = users;
					io.sockets.emit('server lobby update', update);
				}

				
			});

			socket.on('disconnect', function() {
				console.log('client disconnect');
				quitGame(socket.id);
				removeUser(socket);
			});
		});
	}
}