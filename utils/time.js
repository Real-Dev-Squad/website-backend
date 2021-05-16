/**
 * Converts Time in milliseconds to Epoch Time
 * @param {number} time 
 * @returns {number}
 */

const getUnixEpochTime = (time = Date.now()) => {
  return Math.floor(time / 1000)
}

module.exports = { getUnixEpochTime }
