const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERNAME':
    return Object.assign({}, state, {
      username: action.username,
    })

    case 'ENTER_LOBBY':
    return Object.assign({}, state, {
      status: 'lobby'
    })

    case 'ENTER_GAME':
    return Object.assign({}, state, {
      status: 'game'
    })

    case 'CLEAR_USERNAME':
    return Object.assign({}, state, {
      username: '',
    })
    default:
      return state
  }
}

export default Reducer