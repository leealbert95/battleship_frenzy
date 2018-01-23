export const setUserName = username => {
  return {
    type: 'SET_USERNAME',
    username
  }
}

export const enterLobby = () => {
  return {
    type: 'ENTER_LOBBY'
  }
}

export const clearUserName = () => {
  return {
    type: 'CLEAR_USERNAME'
  }
}

export const enterGame = () => {
  return {
    type: 'ENTER_GAME'
  }
}