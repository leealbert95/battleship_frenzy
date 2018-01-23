import React, { Component } from 'react';

export default class ListItem extends Component {

  render() {
    const {
      user,
      key,
    } = this.props;

    var status_color, 
        msg

    if (user.status == 'lobby') 
      status_color = 'green'; 
    else if (user.status == 'game') 
      status_color = 'yellow';
    msg = 'In ' + user.status;

    var outer_style = { 
      lineHeight: '30px', 
      display: 'inline-block',
      width: '100%',
      marginBottom: '-5px',
    }

    var username_style = {
      lineHeight: '30px',
      background: 'grey',
      width: '50%',
      float: 'left',
      textAlign: 'center',
    }

    var status_style = {
      background: status_color,
      float: 'right',
      width: '50%',
      lineHeight: '30px',
      textAlign: 'right',
    }

    return(
      <div key={key} style={outer_style} onClick={() => this.props.onInvite(user.id)}>
        <div style={username_style}>{user.id}</div>
        <div style={status_style}>{msg}</div>
      </div>
    )
  }
}