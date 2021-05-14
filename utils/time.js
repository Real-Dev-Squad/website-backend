const getUnixEpochTime = (time = Date.now()) => {
  return Math.floor(time / 1000)
}

module.exports = { getUnixEpochTime }
