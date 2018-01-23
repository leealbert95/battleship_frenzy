import React, { Component } from 'react';

class Cell extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
  }

  onClick() {
    if (this.props.onClick) 
      this.props.onClick(this.props.row, this.props.col);
    else {
      console.log('none');
      return;
    }
  }

  onHover() {
    if (this.props.onHover)
      this.props.onHover(this.props.row, this.props.col);
    else
      return;
  }

  render() {
    var cellStyle = {
      position: "relative",
      top: this.props.row,
      left: this.props.col,
    }

    var color

    switch(this.props.type) {
      case 'setup':
        if (this.props.ship != '')
          color = 'grey';
        else 
          color = 'blue';
        break;
      case 'player': 
        if (this.props.ship == '')
          color = 'blue';
        if (this.props.state == 'ok')
          color = 'grey';
        else if (this.props.state == 'hit')
          color = 'red';
        break;
      case 'target':
        if (this.props.state == 'blocked')
          color = 'grey';
        else if (this.props.state == 'hit')
          color = 'red';
        else if (this.props.state == 'miss')
          color = 'light blue'; 
        else 
          color = 'blue'; 
    }
    
    return(
      <td style={{...cellStyle, backgroundColor: color}} onClick={this.onClick} onMouseOver={this.onHover} className="cell" title={this.props.row + " " + this.props.col + " " + this.props.ship}/>
    );
  }
}

export default Cell;