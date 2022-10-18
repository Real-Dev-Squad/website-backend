/**
 * Returns a random object from the array of colors to user
 * @param array {array} : array containing objects
 * @returns random Index number : index between the range 0 to array.length
 */
const getRandomIndex = (array = []) => {
  return Math.floor(Math.random() * (array.length - 0) + 0);
};

module.exports = {
  getRandomIndex,
};
