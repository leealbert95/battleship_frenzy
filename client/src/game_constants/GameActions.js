var gameActions = {
  unlock_ult: {
    name: 'Unlock Ultimate', 
    type: 'utility',
    description: 'Combine two Basic powerups to unlock an Ultimate.'
  },
  shoot: { 
    name: 'Shoot',
    size: '1x1',
    tier: 'Basic',
    type: 'offense',
    description: 'Basic attack. Will NOT damage armored or barriered ships.'
  },
  megaton: { 
    name: 'Megaton Bomb',
    size: '3x3',
    tier: 'Basic',
    type: 'offense',
    description: 'Large-radius explosive. Will NOT damage armored or barriered ships.'
  },
  apExplode: { 
    name: 'Armor Piercing Explosive',
    size: '2x2',
    tier: 'Basic',
    type: 'offense',
    description: 'Medium-radius explosive. Will damage armored, but not barriered ships in the area.'
  },  
  crit: { 
    name: 'Critical Strike',
    size: '1x1',
    tier: 'Basic',
    type: 'offense',
    description: 'If target cell is not armored or barriered, will obliterate entire ship. If armored, will damage instead.'
  }, 
  nuke: { 
    name: 'Tactical Nuke',
    size: '3x3',
    tier: 'Ultimate',
    type: 'offense',
    description: 'ULTIMATE ABILITY. Any ship caught in blast will be obliterated. Damages armored ships. Barriered ships are immune.'
  },
  ironDome: { 
    name: 'Iron Dome',
    tier: 'Ultimate',
    type: 'defense',
    description: 'ULTIMATE ABILITY. Equip chosen ship with intercepting system. If caught in a blast, will nullify the attack entirely.'
  },
  salvation: { 
    name: 'Salvation',
    tier: 'Ultimate',
    type: 'defense',
    description: 'ULTIMATE ABILITY. Revive a sunken ship and grant it Armor. Cannot be used to restore a damaged ship.'
  },
  barrier: { 
    name: 'Barrier',
    tier: 'Basic',
    type: 'defense',
    description: 'Equip a ship with barrier system. If caught in blast, blocks the attack and loses the barrier.'
  },
  armor: { 
    name: 'Armor',
    tier: 'Basic',
    type: 'defense',
    description: 'Reinforce every cell of ship with armor. Only cells that lie in blast radius lose armor. May still be damaged by Tactical Nuke or Critical Strike.'
  },
  restore: { 
    name: 'Restore',
    tier: 'Basic',
    type: 'defense',
    description: 'Restore a damaged ship to full health. Cannot be used to revive sunken ships'
  },
}

export default gameActions;