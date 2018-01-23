import React, { Component } from 'react'; 
import '../App.css';

class Card extends Component {

  render() {
    const {
      name,
      type,
      size,
      tier, 
      description,
      onClick,
    } = this.props;

    var color = 'silver'
    if (tier == 'Ultimate') {
      color = 'gold'
    }

    var sizeDescription;
    if (size) {
      sizeDescription = <h4>Size: {size}</h4>
    }
    return (
      <div onClick={onClick} style={{ height: 320, border: `3px solid ${color}`, background:'white', textAlign: 'center' }}>
        <h2>{name}</h2>
        <h3>Tier: {tier}</h3>
        {sizeDescription}
        <p>{description}</p>
      </div>
    )
  }
}

export default Card;