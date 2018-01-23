import React, { Component } from 'react';
import AlertContainer from 'react-alert';
import RenderedBoard from '../board/RenderedBoard.js';
import ShipsPanel from './ShipsPanel.js';
import boardSize from '../game_constants/BoardSize.js';
import _ from 'lodash';
const socket = require('../socket.js');

class SetUpView extends Component {
	constructor(props) {
		super(props);
		var boardRow = [];
		var board = [];
		for (var x = 0; x < boardSize; x++) {
			for (var y = 0; y < boardSize; y++) {
				boardRow.push({
					row: x,
					col: y,
					ship: '',
					hover: false,
				});
			}
			board.push(boardRow);
			boardRow = [];
		}

		var shipSizes = {
			"carrier1": 5,
			"battleship1": 4,
    	"destroyer1" : 3,
    	"destroyer2": 3,
    	"submarine1": 2,
    	"submarine2": 2,
    	"patrolboat1": 1,
    	"patrolboat2": 1,
		};
		
		var shipsPlaced = {
			"carrier": 0,
			"battleship": 0,
    	"destroyer" : 0,
    	"submarine": 0,
    	"patrolboat": 0,
		};

		var maxShipCount = {
			"carrier": 1,
			"battleship": 1,
    	"destroyer" : 2,
    	"submarine": 2,
    	"patrolboat": 2,
		}

		var shipPositions = {
			"carrier1": [],
			"battleship1": [],
    	"destroyer1" : [],
    	"destroyer2": [],
    	"submarine1": [],
    	"submarine2": [],
    	"patrolboat1": [],
    	"patrolboat2": [],
		};

		this.state = {
			board: board,
			ship: "",
			willPlaceShip: false,
    	vertical: false, //To orient ship vertically when placing 
    	shipSizes: shipSizes,
    	shipsPlaced: shipsPlaced,
			shipPositions: shipPositions,
			maxShipCount: maxShipCount,
		}
		this.onCellClick = this.onCellClick.bind(this);
		this.onCellHover = this.onCellHover.bind(this);
		this.onShipSelect = this.onShipSelect.bind(this);
		this.onShipPlaced = this.onShipPlaced.bind(this);
		this.removeShip = this.removeShip.bind(this);
		this.allShipsPlaced = this.allShipsPlaced.bind(this);
	}

	componentDidMount() {
		console.log('setup view mount')

		socket.on('setup alert', (alert) => {
			this.msg.show(alert)
		})
	}

	onShipSelect(shipName) {
		var count = this.state.shipsPlaced[shipName] + 1;
		var ship = `${shipName}${count}`;

		console.log(shipName);
		console.log(this.state.shipsPlaced[shipName])

		this.setState({
			ship: ship,
			newShip: true,
		})
	}

	onShipPlaced(row, col) {
		console.log('onShipPlaced')
		var vertical = this.state.vertical;
		var newShip = this.state.newShip; //Boolean, has user selected new ship?
		var ship = this.state.ship;
		var shipName = ship.slice(0, -1);
		var size = this.state.shipSizes[ship];
		var shipsPlaced = Object.assign({}, this.state.shipsPlaced);
		var count = this.state.shipsPlaced[shipName];
		var board = JSON.parse(JSON.stringify(this.state.board));
		var shipPositions = Object.assign({}, this.state.shipPositions);
		var coordArray = [];

		if (this.isValid(row, col, vertical)) {
			if (vertical) {
				for (var i = 0; i < size; i++) {
					board[row+i][col].ship = ship;
					coordArray.push({
						row: row+i, 
						col: col
					}) 
				}
			} else {
				for (var i = 0; i < size; i++) {
					board[row][col+i].ship = ship;
					coordArray.push({
						row: row, 
						col: col+i
					})
				}
			}

			count++;
			shipPositions[ship] = coordArray;
			shipsPlaced[shipName] = count;

			console.log({
				shipPositions: shipPositions,
				shipsPlaced: shipsPlaced,
				board: board,
				ship: "",
				vertical: false,
			});
			
			this.setState({
				shipPositions: shipPositions,
				shipsPlaced: shipsPlaced,
				board: board,
				ship: "",
				vertical: false,
			});
		}
	}

	removeShip(row, col) {
		console.log('remove ship');

		var board = JSON.parse(JSON.stringify(this.state.board));
		var ship = board[row][col].ship;
		var shipName = ship.slice(0, -1);
		var shipsPlaced = Object.assign({}, this.state.shipsPlaced)
		var shipPositions = Object.assign({}, this.state.shipPositions);
		var cells = shipPositions[ship];
		
		for (var i = 0; i < cells.length; i++ ) 
			board[cells[i].row][cells[i].col].ship = '';
		
		shipPositions[ship] = [];
		shipsPlaced[shipName] = shipsPlaced[shipName] - 1;

		console.log(shipsPlaced[shipName])

		this.setState({
			shipsPlaced: shipsPlaced,
			board: board,
			shipPositions: shipPositions
		})

	}

	onCellClick(row, col) {
		if (this.state.board[row][col].ship == '')
			return this.onShipPlaced(row, col);
		else 
			return this.removeShip(row, col);
	}

	onCellHover(row, col) {
		var board = JSON.parse(JSON.stringify(this.state.board));
		board[row][col].hover = true;
		this.setState({
			board: board
		})
	}

	isValid(row, col, vertical) {
		var size = this.state.shipSizes[this.state.ship];
		if (vertical) {
			if (row + size >= this.state.size)
				return false;
		}
		else {
			if (col + size > this.state.size)
				return false;
		}
		return true;
	}

	allShipsPlaced() {
		var maxShipCount = this.state.maxShipCount;
		var shipsPlaced = this.state.shipsPlaced;

		console.log(maxShipCount)
		console.log(shipsPlaced);

		var shipCounts = [];
		
		shipCounts.push(maxShipCount['carrier'] - shipsPlaced['carrier']);
		shipCounts.push(maxShipCount['battleship'] - shipsPlaced['battleship']);
		shipCounts.push(maxShipCount['destroyer'] - shipsPlaced['destroyer']);
		shipCounts.push(maxShipCount['submarine'] - shipsPlaced['submarine']);
		shipCounts.push(maxShipCount['patrolboat'] - shipsPlaced['patrolboat']);

		for (var i = 0; i < shipCounts.length; i++) {
			if (shipCounts[i] != 0)
				return false;
		}
		return true;
	}

	orientShip() {
		if (this.state.vertical) {
			this.setState({
				vertical: false
			})
		} else {
			this.setState({
				vertical: true	
			})
		}
	}

	onSubmit() {
		if (this.allShipsPlaced()) 
			socket.emit('client finish setup', this.state.shipPositions)
		else
			this.msg.show('You have not placed all your ships!')	
	}

  render() {
		console.log('load set up')
		console.log(this.state.board)
		
		const alertOptions = {
      position: 'top right',
      theme: 'light',
      time: 2000,
    }

    return (
    	<div className="container">
				<AlertContainer ref={a => this.msg = a} {...alertOptions}/>
	    	<div className="board-wrapper-left">
					<RenderedBoard type="setup" onClick={this.onCellClick} board={this.state.board}/>
	      </div>
				<div style={{ position: 'relative', top: '50px', }}>
					<div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
						<button className="game-button" onClick={() => this.orientShip()} value={"orient"}>
							Place Vertically
						</button>
					</div>
					<div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
						<button className="game-button" onClick={() => this.onSubmit()}>
							Submit Ships
						</button>
					</div>
				</div>
	      <div className="ships-wrapper">
	      	<ShipsPanel shipsPlaced={this.state.shipsPlaced} maxShipCount={this.state.maxShipCount} onClick={this.onShipSelect}/>
	      </div>
      </div>
    );
  }
}

export default SetUpView;