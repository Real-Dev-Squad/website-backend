/**
 * Parses the query params and returns a key value object
 *
 * @param queryString {string} - string which is received on the http request
 * @return resultParams {Object} - contains key value pairs of query params
 */
const parseQueryParams = (queryString) => {
  try {
    const urlParams = new URLSearchParams(queryString);

    const resultParams = {};
    for (const [key, value] of urlParams) {
      if (!key || !value) continue;
      if (key !== "q") {
        if (!resultParams[key]) {
          resultParams[key] = new Set();
        }
        resultParams[key].add(value);
        continue;
      }
      const queries = value.trim().replace(" ", "+").split(",");
      for (const query of queries) {
        if (!query) continue;
        const [searchTerm, searchValueString] = query.trim().split(":");
        const searchValues = searchValueString.trim().split("+");
        for (const searchValue of searchValues) {
          if (!searchValue) continue;
          if (!resultParams[searchTerm]) {
            resultParams[searchTerm] = new Set();
          }
          resultParams[searchTerm].add(searchValue);
        }
      }
    }

    for (const [key, value] of Object.entries(resultParams)) {
      if (value.size > 1) {
        resultParams[key] = [...resultParams[key]];
      } else {
        const [first] = resultParams[key];
        resultParams[key] = first;
      }
    }
    return resultParams;
  } catch (error) {
    logger.error(`Error parsing the queries: ${error}`);
  }
  return {};
};

module.exports = { parseQueryParams };
