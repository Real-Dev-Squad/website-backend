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

module.exports = {
  chunks,
};
