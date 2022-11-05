/**
 * Returns a random object from the array of colors to user
 * @param array {array} : array containing objects
 * @returns random Index number : index between the range 0 to array.length
 */
const getRandomIndex = (arrayLength = 10) => {
  return Math.floor(Math.random() * arrayLength);
};

module.exports = {
  getRandomIndex,
};
