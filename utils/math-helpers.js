/**
 * Rounds number to 2 precision after decimal point
 * @param num { Number }
 * @return {Number}
 */
const roundToTwoDigits = (num) => {
  return Math.round(num * 100) / 100
}

module.exports = {
  roundToTwoDigits
}
