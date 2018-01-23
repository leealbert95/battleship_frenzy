var _ = require('lodash');
var Game = require('./Game.js');

module.exports = function(p1, p2) {
	var player1_ships;
	var player2_ships;

	var _startGame = function() {
		var player1Info = {
			socket: p1,
			id: p1.id,
			ships: player1_ships
		}

		var player2Info = {
			socket: p2,
			id: p2.id,
			ships: player2_ships	
		}
		console.log('Session.js: startGame()')
		var game = new Game(player1Info, player2Info);
		game.start();
	}

	this.start = function() {

		p1.emit('load game view');
		p2.emit('load game view');

		var finishSetupMsg = 'The opponent has finished setting up their ships';
		var waitingMsg = 'Waiting on opponent to finish set up';

		p1.on('client finish setup', function(ships) {
			player1_ships = ships;
			console.log(player2_ships)
			if (player2_ships) {
				console.log('Session.js: Starting game')
				_startGame();
			} else {
				p2.emit('setup alert', finishSetupMsg);
				p1.emit('setup alert', waitingMsg)
			}
		});

		p2.on('client finish setup', function(ships) {
			player2_ships = ships;
			console.log(player1_ships)
			if (player1_ships) {
				console.log('Session.js: Starting game')
				_startGame();
			} else {
				p1.emit('setup alert', finishSetupMsg);
				p2.emit('setup alert', waitingMsg)
			}
		})
		
	}
}

