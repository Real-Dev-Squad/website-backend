/**
 * Recursively flattens an object with nested objects and arrays into a single-depth object.
 *
 * @param {object} obj - The object to flatten.
 * @param {string} [parentKey=""] - The parent key for nested objects.
 * @return {object} The flattened object.
 */

export function flattenObject(obj, parentKey = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (Array.isArray(obj[key])) {
      acc[newKey] = obj[key].map((item, index) => {
        if (typeof item === "object" && item !== null) {
          return flattenObject(item, `${newKey}[${index}]`);
        } else {
          return item;
        }
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
}
