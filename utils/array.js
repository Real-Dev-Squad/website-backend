/**
 * Creates an array of elements split into groups the length of size. If array can't be split evenly, the final chunk will be the remaining elements.
 * description credit: https://lodash.com/docs/4.17.15#chunk
 * source code inspiron: https://youmightnotneed.com/lodash#chunk
 * @param {array}: array to be splitted into groups
 * @param {size}: size of array groups
 * @return {array}: array of arrays of elements split into groups the length of size.
 */
function chunks(array, size = 1) {
  if (!Array.isArray(array) || size < 1) {
    return [];
  }
  const temp = [...array];
  const result = [];
  while (temp.length) {
    result.push(temp.splice(0, size));
  }
  return result;
}

/**
 * Checks if two arrays have any common items
 * @param array1 {Array} - first array
 * @param array2 {Array} - second array
 * @returns {boolean} - true if the arrays have at least one common item, false otherwise
 */

function arraysHaveCommonItem(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2) || array1.length > 100 || array2.length > 100) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      /* eslint-disable security/detect-object-injection */
      if (array1[i] === array2[j]) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  chunks,
  arraysHaveCommonItem,
};
