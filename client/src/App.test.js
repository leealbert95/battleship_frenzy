import React, { Component } from 'react';
import logo from './logo.svg';
import _ from 'lodash';
import gameActions from './game_constants/GameActions.js';
import './App.css';
import Modal from 'react-modal';
import StackGrid, { transitions } from 'react-stack-grid';
import Card from './components/Card.js';
import AlertContainer from 'react-alert'
const { scaleDown } = transitions; 

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			turnActive: true,
			curAction: '',
			powerups: ['Megaton Bomb', 'Armor Piercing Explosive', 'Tactical Nuke', 'Barrier', 'Armor', 'Armor Piercing Explosive', 'Salvation', 'Armor'],
			ults_available: [],
			actionsToTrade: [],
		}

		this.handleCardClick = this.handleCardClick.bind(this);
		this.newAction = this.newAction.bind(this);
		this.shootBoard = this.shootBoard.bind(this);
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
					this.msg.show('Unlocked Ultimate')
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

	shootBoard() {
		this.msg.show(this.state.curAction)
	}

	handleCardClick(name, index) {
		console.log('card clicked')
		console.log(index)
		this.msg.show('Ability Used')
		var powerups = this.state.powerups.slice();
		powerups.splice(index, 1)
		console.log(powerups)
		this.setState({
			powerups: powerups
		})
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
				<div className="board-container">
					<div className="board-wrapper-left" id="targeting-board">
						<div className="board"/>
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
						<div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
							<button className="game-button" style={{ backgroundColor: 'green' }} onClick={() => this.shootBoard()}>
								Ship
							</button>
						</div>
					</div>
					<div className="board-wrapper-right" id="player-board">
						<div className="board"/>
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
									onClick={() => this.newAction(name)}
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

export default App;


