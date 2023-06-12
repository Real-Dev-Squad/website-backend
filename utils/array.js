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
 * @param array1 {Array<string, number>} - first array
 * @param array2 {Array<string, number>} - second array
 * @returns {boolean} - true if the arrays have at least one common item, false otherwise
 */

function arraysHaveCommonItem(array1, array2) {
  if (!array1?.length || !array2?.length) {
    return false;
  }
  return array1.some((value) => array2.includes(value));
}

function arraysHaveSameValues(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = array1.sort();
  const sortedArray2 = array2.sort();

  for (let i = 0; i < sortedArray1.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  return true;
}

module.exports = {
  chunks,
  arraysHaveCommonItem,
  arraysHaveSameValues,
};
