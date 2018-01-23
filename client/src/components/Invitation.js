import React, { Component } from 'react';

class Invitation extends Component {

  render () {
    const {
      sender,
      onClick,
    } = this.props;

    var button_style = {
      width: '80px',
      height: '40px',
      margin: '5px',
    }

    return (
      <div style={{background: 'grey', width: '200px', fontWeight: '200'}}>
        <h1>{sender}</h1>
        <p>{ 'has challenged you to a match!'}</p>
        <div style={{justifyContent: 'space-around', display: 'inline-block'}}> 
          <div onClick={() => onClick(true, sender)} style={{...button_style, float: 'left', background: 'green'}}></div>
          <div onClick={() => onClick(false, sender)} style={{...button_style, float: 'right', background: 'red'}}></div>
        </div>
      </div>
    )
  }
}

export default Invitation