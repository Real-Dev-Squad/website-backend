/**
 * Loops over an array of objects, takes a value corresponding to key provided and saves it in an array
 *
 * @param arrayOfObjects {Array} - Array of objects to loop over
 * @param key {String} - Value corresponding to this key is saved
 */

const getNames = (arrayOfObjects, key) => {
  const names = []
  arrayOfObjects.forEach((object) => {
    names.push(object[key])
  })
  return names
}

module.exports = {
  getNames
}
