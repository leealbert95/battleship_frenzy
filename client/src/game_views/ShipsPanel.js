import React, { Component } from 'react';

class ShipsPanel extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(shipname) {
		const {
			shipsPlaced,
			maxShipCount,
		} = this.props;
		
  	if (shipsPlaced[shipname] == maxShipCount[shipname])
  		return
		return this.props.onClick(shipname);
  }

  render() {
		const {
			shipsPlaced,
			maxShipCount,
		} = this.props;

		var shipCounts = [];

  	shipCounts.push(1 - shipsPlaced['carrier']);
  	shipCounts.push(1 - shipsPlaced['battleship']);
  	shipCounts.push(2 - shipsPlaced['destroyer']);
  	shipCounts.push(2 - shipsPlaced['submarine']);
		shipCounts.push(2 - shipsPlaced['patrolboat']);

  	return(
	    <div className="ships-panel">
	    	<div className="category" onClick={() => this.onClick('carrier')}>{`Carriers: x${shipCounts[0]}`}</div>
	    	<div className="category" onClick={() => this.onClick('battleship')}>{`Battleships: x${shipCounts[1]}`}</div>
	    	<div className="category" onClick={() => this.onClick('destroyer')}>{`Destroyers: x${shipCounts[2]}`}</div>
	    	<div className="category" onClick={() => this.onClick('submarine')}>{`Submarines: x${shipCounts[3]}`}</div>
	    	<div className="category" onClick={() => this.onClick('patrolboat')}>{`Patrol Boats: x${shipCounts[4]}`}</div>
	    </div>
    );
  }
}

export default ShipsPanel;