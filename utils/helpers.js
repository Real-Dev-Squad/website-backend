/**
 * @param value:
 * @returns boolean which returns
 * - `true` if value is empty or falsy
 * - `false`  if value is not empty or truthy
 */
function isEmpty(valueToCheck) {
  switch (typeof valueToCheck) {
    case "undefined":
      return true;
    case "string":
      return valueToCheck.trim().length === 0 || valueToCheck.length === 0;
    case "object":
      if (valueToCheck === null) {
        return true;
      } else if (Array.isArray(valueToCheck)) {
        return valueToCheck.length === 0;
      } else {
        return Object.keys(valueToCheck).length === 0;
      }
    case "number":
      return Number.isNaN(valueToCheck);
    default:
      return false;
  }
}

module.exports = {
  isEmpty,
};
