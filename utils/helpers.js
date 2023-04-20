/**
 * @param value:
 * @returns boolean which returns
 * - `true` if value is empty or falsy
 * - `false`  if value is not empty or truthy
 */
function isEmpty(value) {
  switch (typeof value) {
    case "undefined":
      return true;
    case "string":
      return value.trim().length === 0;
    case "object":
      if (value === null) {
        return true;
      } else if (Array.isArray(value)) {
        return value.length === 0;
      } else {
        return Object.keys(value).length === 0;
      }
    case "number":
      return Number.isNaN(value);
    default:
      return false;
  }
}

module.exports = {
  isEmpty,
};
