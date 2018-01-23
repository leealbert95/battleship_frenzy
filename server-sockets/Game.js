var _ = require('lodash')
, gameActions = require('./GameActions'); 

module.exports = function(player1Info, player2Info) {

	var p1 = player1Info.socket
		, p2 = player2Info.socket
		, id1 = player1Info.id
		, id2 = player2Info.id

	var boardSize = 13;

	var playerStates = {}; 

	playerStates[id1] = {
		shipCount: 0,
		turnActive: false,
		board: [],
		ships: {},
		powerups: [],
	};

	playerStates[id2] = {
		shipCount: 0,
		turnActive: false,
		board: [],
		ships: {},
		powerups: [],
	};


	var updatePlayerState = function(id, newState) {
		if (newState.turnActive)
			playerStates[id].turnActive = newState.turnActive; 
		if (newState.board)
			playerStates[id].board = newState.board;
		if (newState.ships)
			playerStates[id].ships = newState.ships;
		if (newState.shipCount)
			playerStates[id].shipCount = newState.shipCount;
		if (newState.powerups)
			playerStates[id].powerups = newState.powerups;
	}

	var initShips = function(board, ships) {
		var shipCount = 0; 

		_.forOwn(ships, function(ship, key) {
			_.forEach(ship, function(cell) {
				console.log('key: '+ key)
				board[cell.row][cell.col].ship = key; 
				board[cell.row][cell.col].state = 'ok';
				cell.state = 'ok';
			});
			shipCount++;
		});

		return shipCount;
	}

	var emitForBoth = function(action, send) {
		p1.emit(action, send);
		p2.emit(action, send);
	}

	var onForBoth = function(action, fn) {
		p1.on(action, fn)
		p2.on(action, fn)
	}

	var affectWholeShip = function(ship, board, action, affected) {
		var state;
		switch (action) {
			case 'iron dome':
				state = 'intercept';
				break;
			case 'armor':
				state = 'armor';
				break;
			case 'barrier': 
				state = 'barrier';
				break;
			case 'remove shield':
				state = 'ok';
				break;
			case 'destroy':
				state = 'hit';
				break;
			case 'revive':
				state = 'ok';
				break;
		}
		var row, col;
		for (var i = 0; i < ship.length; i++) {
			ship[i].state = state;
			board[ship[i].row][ship[i].col].state = state;
			if (affected != null) //Need to keep track of affected grids if processing offensive ability
				affected.push({
					row: ship[i].row,
					col: ship[i].col,
					state: state,
				})
		}
	}

	var isDestroyed = function(ship) {
		for (var i = 0; i < ship.length; i++) {
			if (ship[i].state != 'hit')
				return false;
		}
		return true; 
	}

	var giveRandomPowerUp = function(powerups, destroyed, ultimate) {

		var chooseRandom = function (powerups) {
			var keys = Object.keys(powerups);
			return powerups[keys[keys.length * Math.random() << 0]]; 
		}

		var powerup;
		for (var i = 0; i < destroyed; i++) {
			if (ultimate)
				powerup = chooseRandom(gameActions.ultimate);
			else
				powerup = chooseRandom(gameActions.basic)
			powerups.push(powerup);
		}
	}

	var shootBoardUtils = function(aoe, opponentBoard, opponentShips, opponentShipCount, name) {
		
		var shipsBefore = Object.assign({}, opponentShips); //save prev state of board in case attack is intercepted
		var boardBefore = JSON.parse(JSON.stringify(opponentBoard));
		var affected = []; //Keep track of which cells have been affected
		
		var ignoredShips = [] //So that ships protected once will still remain intact even if caught in a large bomb radius
			, blocks = 0
			, alreadyHit = 0
			, destroyed = 0
			, hits = 0
			, shipName
			, ship;

		var intercepted = false;
		console.log(opponentBoard[0][0])
		for (var i = 0; i < aoe.length; i++) {
			console.log(aoe[i].row)
			shipName = opponentBoard[aoe[i].row][aoe[i].col].ship;
			if (shipName != '') {
				ship = opponentShips[shipName];
				var i = _.findIndex(ship, { row: aoe[i].row, col: aoe[i].col });
				if (opponentBoard[aoe[i].row][aoe[i].col].state == 'intercept') { //If true, then restore ships and board to previous state, undoing any hits registered previously in aoe
					affectWholeShip(ship, opponentBoard, 'remove shield')
					intercepted = true;
					opponentShips = shipsBefore;
					opponentBoard = boardBefore;
					affected = aoe;
					for (var i = 0; i < affected.length; i++) { //If intercepted, return aoe for affected cells but set states to intercepted
						affected[i].state = 'intercept';
					}
					return { intercepted: true, affected: affected };
				} else if (opponentBoard[aoe[i].row][aoe[i].col].state == 'barrier') {
					if (_.findIndex(ignoredShips, shipName) == -1) {
						affectWholeShip(ship, opponentBoard, 'remove shield');
						blocked++;
						ignoredShips.push(shipName);
					}
					affected.push({ 
						row: aoe[i].row,
						col: aoe[i].col,
						state: 'blocked',
					})
				} else if (opponentBoard[aoe[i].row][aoe[i].col].state == 'armor') {
					if (name == gameActions.basic.apExplode || name == gameActions.ultimate.nuke) {
						opponentBoard[aoe[i].row][aoe[i].col].state = 'hit';
						ship[i].state = 'hit';
						hits++;
						affected.push({ 
							row: aoe[i].row,
							col: aoe[i].col,
							state: 'hit',
						})
					} else {
						ship[i].state = 'ok';
						opponentBoard[aoe[i].row][aoe[i].col].state = 'ok';
						affected.push({ 
							row: aoe[i].row,
							col: aoe[i].col,
							state: 'blocked',
						})
						blocked++;
					}
				} else if (opponentBoard[aoe[i].row][aoe[i].col].state == 'ok' 
					&& (name == gameActions.ultimate.nuke || name == gameActions.basic.crit)) {
					if (_.findIndex(ignoredShips, shipName) == -1) {
						affectWholeShip(ship, opponentBoard, 'destroy', affected);
						hits++;
						destroyed++; 
						opponentShipCount--;
						ignoredShips.push(ship);
					}
				} else if (opponentBoard[aoe[i].row][aoe[i].col].state == 'ok') {
					if (_.findIndex(ignoredShips, shipName) == -1) {
						ship[i].state = 'hit';
						opponentBoard[aoe[i].row][aoe[i].col].state = 'hit';
						hits++; 
						if (isDestroyed(ship)) {
							destroyed++; 
							opponentShipCount--;
						}
					}
					affected.push({
						row: aoe[i].row,
						col: aoe[i].col,
						state: 'hit',
					})
				}
			} else {
				opponentBoard[aoe[i].row][aoe[i].col].state = 'miss' 
				affected.push({
					row: aoe[i].row,
					col: aoe[i].col,
					state: 'miss',
				})
			}
		} 
	
		return { 
			blocks: blocks, 
			destroyed: destroyed, 
			hits: hits, 
			shipCount: opponentShipCount, 
			affected: affected,
		};
	}

	var shootBoard = function(coords, player, opponent, name) {

		var opponentId = opponent.id;
		var opponentBoard = JSON.parse(JSON.stringify(playerStates[opponentId].board));
		var opponentShips = Object.assign({}, playerStates[opponentId].ships); 
		var opponentShipCount = playerStates[opponentId].shipCount;
		var aoe = []; //area of effect

		switch (name) {
			case gameActions.shoot:
				aoe.push(coords);
				break;
			case gameActions.crit:
				aoe.push(coords);
				break;
			case gameActions.basic.apExplode:
				for (var row = coords.row; row < coords.row+2; row++) {
					for (var col = coords.col; col < coords.col+2; col++) {
						aoe.push({row: row, col: col, state: ''});
					}
				}
				break;
			case gameActions.basic.megaton:
				for (var row = coords.row; row < coords.row+2; row++) {
					for (var col = coords.col; col < coords.col+2; col++) {
						aoe.push({row: row, col: col, state: ''});
					}
				}
				break;
			case gameActions.ultimate.nuke:
				for (var row = coords.row-1; row < coords.row+2; row++) {
					for (var col = coords.col-1; col < coords.col+2; col++) {
						aoe.push({row: row, col: col, state: ''});
					}
				}
				break;
		}

		var result = shootBoardUtils(aoe, opponentBoard, opponentShips, opponentShipCount, name);

		return { 
			forOpponent: true, 
			board: opponentBoard, 
			ships: opponentShips, 
			shipCount: result.shipCount, 
			destroyed: result.destroyed,
			affected: result.affected,
		}
	}

	var unlockUltimate = function(discarded, player, opponent) {
		var playerId = player.id;
		var powerups = JSON.parse(JSON.stringify(playerStates[playerId].powerups));
		var result = {};
		var index;

		for (var i = 0; i < discarded.length; i++) {
			index = _.findIndex(powerups, discarded[i])
			powerups.splice(index, 1)
		}

		var ultimate = giveRandomPowerUp(powerups, 1, true)
		powerups.append(ultimate)

		return {
			forPlayer: true,
			powerups: powerups,
		}
	}

	var processAction= function(action) {
		var opponent, player, opponentId, playerId, result = {};
		console.log('New Action: ' + action.from)
		console.log('Action name: ' + action.name)

		if (action.from == id1) {
			opponent = p2;
			player = p1;
		} else if (action.from == id2) {
			opponent = p1;
			player = p2;
		} else 
			throw new Error('User id is not in this match');
		
		opponentId = opponent.id; 
		playerId = player.id;

		switch (action.name) {
			case gameActions.shoot:
				result = shootBoard(action.coords, player, opponent, action.name);
				break;
			case gameActions.unlock_ult: 
				result = unlockUltimate(action.discarded, player, oppponent);
				break;
			case gameActions.basic.apExplode:
				result = shootBoard(action.coords, player, opponent, action.name);
				break;
			case gameActions.basic.megaton:
				result = shootBoard(action.coords, opponent, action.name);
				break;
			case gameActions.basic.reinforce:
				result = defensiveMove(action.coords, opponent);
				break;
			case gameActions.basic.restore:
				result = defensiveMove(action.coords, opponent, );
				break;
			case gameActions.ultimate.ironDome:
				result = defensiveMove(action.coords, opponent);
				break;
			case gameActions.ultimate.nuke:
				result = shootBoard(action.coords, player, opponent, action.name);
				break;
			case gameActions.ultimate.salvation:
				result = defensiveMove(action.coords, player)
		}

		var powerups = playerStates[playerId].powerups.slice();
		

		if (action.name == gameActions.unlock_ult) {
			powerups = result.powerups;
		}

		var index = _.findIndex(powerups, action.name)
		powerups.splice(index, 1)

		if (result.forOpponent) { //If action affects enemy's ships (Offensive moves)
			if (result.destroyed > 0)
				giveRandomPowerUp(powerups, result.destroyed, false) //Will mutate powerups array
			updatePlayerState(opponentId, {
				turnActive: true,
				board: result.board,
				ships: result.ships,
				shipCount: result.shipCount,
			});

			updatePlayerState(playerId, {
				turnActive: false,
				powerups: powerups,
			})
		} else if (result.forPlayer) { //If action affects own ships (Defensive moves)
			updatePlayerState(playerId, {
				turnActive: false,
				board: result.board,
				ships: result.ships,
				shipCount: result.shipCount,
				powerups: powerups,
			})

			updatePlayerState(opponentId, {
				turnActive: true,
			})
		}

		console.log(result.affected)
		player.emit('return hits', result.affected)

		console.log(playerId + " finished turn: Turn is " + playerStates[playerId].turnActive);
		console.log(opponentId + " finished turn: Turn is " + playerStates[opponentId].turnActive)

		player.emit('update player state', playerStates[playerId])
		opponent.emit('update player state', playerStates[opponentId])

		setTimeout(function(){
			player.emit('change turns', playerStates[playerId].turnActive)
			opponent.emit('change turns', playerStates[opponentId].turnActive)
		}, 1000)
	}

	var createBoards = function(p1Ships, p2Ships) {
		var boardRow = [];
		var board1 = [];
		for (var x = 0; x < boardSize; x++) {
			for (var y = 0; y < boardSize; y++) {
				boardRow.push({
					row: x,
					col: y,
					ship: '',
					state: '',
				});
			}
			board1.push(boardRow);
			boardRow = [];
		}
		var board2 = JSON.parse(JSON.stringify(board1)); 
		var count1 = initShips(board1, p1Ships);
		var count2 = initShips(board2, p2Ships);

		console.log(id1);
		console.log(id2);

		updatePlayerState(id1, {
			board: board1,
			ships: p1Ships,
			shipCount: count1
		});

		updatePlayerState(id2, {
			board: board2, 
			ships: p2Ships, 
			shipCount: count2
		}); 

	}

	var initState = function() {

		var p1Ships = player1Info.ships
			, p2Ships = player2Info.ships

		createBoards(p1Ships, p2Ships);
		
		console.log('Init State: ' + id1 + ' turn: ' + playerStates[id1].turnActive)
		console.log('Init State: ' + id2 + ' turn: ' + playerStates[id2].turnActive)

		if (Math.random(0,2) == 1) //coin flip!
			updatePlayerState(id1, {turnActive: true})
		else 
			updatePlayerState(id2, {turnActive: true})

		console.log('Init State: ' + id1 + ' turn: ' + playerStates[id1].turnActive)
		console.log('Init State: ' + id2 + ' turn: ' + playerStates[id2].turnActive)
	}

	this.start = function() {

		console.log('Game.js: start()')

		initState();

		p1.emit('enter game');
		p2.emit('enter game')

		p1.emit('init player state', playerStates[id1]);
		p2.emit('init player state', playerStates[id2]);

		setTimeout(function(){
			p1.emit('change turns', playerStates[id1].turnActive);
			p2.emit('change turns', playerStates[id2].turnActive);
		}, 1000)

		onForBoth('client game action', function(action) {
			processAction(action);
		});
	}
}