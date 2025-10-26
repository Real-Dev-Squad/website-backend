/**
 * Safely sets a property on an object to prevent object injection.
 *
 * @param {Object} target
 * @param {string} key
 * @param {any} value
 */
export function setSafe(target, key, value) {
  if (typeof key !== "string") return;
  if (key === "__proto__" || key === "constructor" || key === "prototype") return;
  Reflect.set(target, key, value);
}

/**
 * Safely gets a property from an object.
 * @param {Object} target
 * @param {string} key
 * @returns {any}
 */
export function getSafe(target, key) {
  if (typeof key !== "string") return undefined;
  if (key === "__proto__" || key === "constructor" || key === "prototype") return undefined;
  return Reflect.get(target, key);
}

/**
 * Parses the query params and returns a key value object (fully secure version)
 *
 * @param queryString {string} - string which is received on the http request
 * @return resultParams {Object} - contains key value pairs of query params
 */
const parseQueryParams = (queryString) => {
  try {
    const urlParams = new URLSearchParams(queryString);
    const resultParams = Object.create(null);

    for (const [key, value] of urlParams) {
      if (!key || !value) continue;
      const safeKey = String(key);
      if (safeKey !== "q") {
        let existing = getSafe(resultParams, safeKey);
        if (!existing) {
          existing = new Set();
          setSafe(resultParams, safeKey, existing);
        }
        existing.add(value);
        continue;
      }

      const queries = value.trim().replace(/\s+/g, "+").split(",");
      for (const query of queries) {
        if (!query) continue;
        const [searchTerm, searchValueString] = query.trim().split(":");
        if (!searchTerm || !searchValueString) continue;

        const safeSearchTerm = String(searchTerm);
        const searchValues = searchValueString.trim().split("+");
        let existing = getSafe(resultParams, safeSearchTerm);
        if (!existing) {
          existing = new Set();
          setSafe(resultParams, safeSearchTerm, existing);
        }
        for (const searchValue of searchValues) {
          if (!searchValue) continue;
          existing.add(searchValue);
        }
      }
    }

    for (const safeKey of Object.keys(resultParams)) {
      const value = getSafe(resultParams, safeKey);
      if (value instanceof Set) {
        if (value.size > 1) {
          setSafe(resultParams, safeKey, [...value]);
        } else {
          const [first] = value;
          setSafe(resultParams, safeKey, first);
        }
      }
    }

    return resultParams;
  } catch (error) {
    logger.error(`Error parsing the queries: ${error}`);
  }
  return {};
};

module.exports = { parseQueryParams };
