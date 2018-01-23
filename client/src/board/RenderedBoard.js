import React, { Component } from 'react';
import Cell from './Cell.js';

class RenderedBoard extends Component {
  constructor(props) {
    super(props);

  }

  render() {

    if (this.props.board == [] ) {
      return null
    }

    var cells = [];
    var cellRow = [];

    var onClick, onHover;

    if (!this.props.disable) {
      onClick = this.props.onClick;
      onHover = this.props.onHover;
    }

    var size = this.props.board.length;

    for (var x = 0; x < size; x++) {
      for (var y = 0; y < size; y++) {
        var cellProps = this.props.board[x][y]; 
        cellRow.push(<Cell {...cellProps} type={this.props.type} onClick={onClick} onHover={onHover}/>);
      }
      cells.push(<tr>{cellRow}</tr>);
      cellRow = [];
    }

    return (
      <table className="board" cellSpacing="0">
        {cells}
      </table>
    );
  }
}

export default RenderedBoard;