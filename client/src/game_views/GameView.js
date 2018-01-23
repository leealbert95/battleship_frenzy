import React, { Component } from 'react';
import { connect } from 'react-redux';
import RenderedBoard from '../board/RenderedBoard.js';
import socket from '../socket.js';
import _ from 'lodash';
import AlertContainer from 'react-alert';
import gameActions from '../game_constants/GameActions.js';
import boardSize from '../game_constants/BoardSize.js';
import Modal from 'react-modal';
import StackGrid, { transitions } from 'react-stack-grid';
import Card from '../components/Card.js'
const { scaleDown } = transitions; 

class GameView extends Component {
	constructor(props) {
		super(props);

		var boardRow = [];
		var enemyBoard = [];
		for (var x = 0; x < boardSize; x++) {
			for (var y = 0; y < boardSize; y++) {
				boardRow.push({
					row: x,
					col: y,
					state: '',
				});
			}
			enemyBoard.push(boardRow);
			boardRow = [];
		}

		this.state = {
			shipCount: 0,
			turnActive: false,
			board: [], 
			enemyBoard: enemyBoard,
			ships: {},
			actionsToTrade: [],
			curAction: '',
			powerups: [],
		}

		this.shootBoard = this.shootBoard.bind(this);
		this.defendBoard = this.defendBoard.bind(this); 
		this.newAction = this.newAction.bind(this);
	}

	componentDidMount() {

		socket.on('init player state', (newState) => {
			this.setState({
				shipCount: newState.shipCount,
				board: newState.board,
				ships: newState.ships,
			})
		});

		socket.on('update player state', (newState) => {
			console.log('update player state')
			console.log(newState)
			this.setState({
				shipCount: newState.shipCount,
				board: newState.board,
				ships: newState.ships,
				powerups: newState.powerups,
			})
		})

		socket.on('return hits', (affected) => {
			var enemyBoard = this.updateEnemyBoard(affected)
			this.setState({
				enemyBoard: enemyBoard,
			})
		})

		socket.on('change turns', (turnActive) => {
			console.log('change turns')
			console.log(turnActive)
			this.setState({
				turnActive: turnActive
			})
		})
	}

	updateEnemyBoard(affected) {
		var enemyBoard = JSON.parse(JSON.stringify(this.state.enemyBoard));
		for (var i = 0; i < affected.length; i++) {
			enemyBoard[affected[i].row][affected[i].col].state = affected[i].state;
		}
		return enemyBoard;
	}

	newAction(action) {
		if (action == gameActions.shoot.name) {
			this.msg.show('Shoot equipped')
			this.setState({curAction: action})
		} else if (action == gameActions.unlock_ult.name) {
			this.msg.show('Will Unlock Ultimate')
			this.setState({curAction: action})
		} else if (this.state.curAction == gameActions.unlock_ult.name) {
			var powerup = _.find(gameActions, { name: action });
			if (powerup.tier == 'Ultimate') {
				this.msg.show('Cannot trade in an ultimate ability')
			} else {
				var actionsToTrade = this.state.actionsToTrade.slice();
				actionsToTrade.push(action)
				console.log(actionsToTrade)
				this.msg.show(actionsToTrade.length)
				if (actionsToTrade.length == 2) {
					socket.emit({
						from: this.props.username,
						discarded: this.state.actionsToTrade,
						name: this.state.curAction,
					})
					this.setState({
						actionsToTrade: [],
						curAction: '',
					})
				} else {
					this.msg.show('Powerup 1 picked to trade')
					this.setState({
						actionsToTrade: actionsToTrade
					})
				}
			} 
		} else {
			this.msg.show('Equipped powerup')
			this.setState({curAction: action})
		}
	}

	shootBoard(row, col) {
		console.log('Shooting board')
		if (this.state.curAction == '') {
			this.msg.show('You have not chosen an action!')
			return;
		}
		var powerup = _.find(gameActions, { name: this.state.curAction });
		console.log(powerup)
		if (powerup.type == 'defense' || powerup.type == 'utility') {
			console.log(powerup.type)
			this.msg.show('Invalid action, choose new action')
			this.setState({
				curAction: '',
			})
		} else {
			socket.emit('client game action', {
				from: this.props.username,
				coords: {row: row, col: col},
				name: this.state.curAction,
			})
			this.setState({
				curAction: ''
			})
		}
	}

	defendBoard(row, col) {
		if (this.state.curAction == '') {
			this.msg.show('You have not chosen an action!')
			return;
		}
		var powerup = _.find(gameActions, { name: this.state.curAction });
		if (powerup.type == 'offense' || powerup.type == 'utility') {
			this.msg.show('Invalid action, choose new action')
			this.setState({
				curAction: '',
			})
		} else {
			socket.emit('client game action', {
				from: this.props.username,
				coords: {row: row, col: col},
				name: this.state.curAction,
			})
			this.setState({
				curAction: ''
			})
		}
	}

	render() {

		var zIndex = 0
		if (!this.state.turnActive)
			zIndex = -5;

		const alertOptions = {
			position: 'top right',
			theme: 'light',
			time: 2000,
		}
		
		return (
			<div style={{ height: '600px'}}>
				<div className="container">
					<div className="board-wrapper-left" id="targeting-board">
						<RenderedBoard onClick={this.shootBoard} type="target" board={this.state.enemyBoard}/>
					</div>
					<div style={{ position: 'relative', top: '50px', }}>
						<div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
							<button className="game-button" style={{ backgroundColor: 'green' }} onClick={() => this.newAction(gameActions.shoot.name)}>
								Shoot!
							</button>
						</div>
						<div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
							<button className="game-button" style={{ backgroundColor: 'red' }} onClick={() => this.newAction(gameActions.unlock_ult.name)}>
								Unlock Ultimate
							</button>
						</div>
					</div>
					<div className="board-wrapper-right" id="player-board">
						<RenderedBoard onClick={this.defendBoard} type="player" board={this.state.board}/>
					</div>
				</div>
				<div>
				</div>
				<div className="cards-wrapper">
					<StackGrid
						columnWidth={150}
						style={{zIndex: `${zIndex}`}}
						appear={scaleDown.appear}
						appear={scaleDown.appeared}
						enter={scaleDown.enter}
						entered={scaleDown.entered}
						leaved={scaleDown.leaved}
					>
						{this.state.powerups.map((name, index) => {
							var powerup = _.find(gameActions, { name: name });
							return (
								<Card
									name={name}
									type={powerup.type}
									size={powerup.size}
									tier={powerup.tier}
									description={powerup.description}
									onClick={() => this.newAction(index)}
								/>)
						})}
					</StackGrid>
				</div>
				<Modal
					isOpen={!this.state.turnActive}
					overlayClassName="modal-overlay"
				>	
					<div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', lineHeight: '400px' }}>
						<h1 style={{ fontSize: '50px' }}>ENEMY TURN</h1>
					</div>
				</Modal>
				<AlertContainer ref={a => this.msg = a} {...alertOptions}/>
			</div>
		);
	}			
}

export default GameView;