const splitQuery = (query) => {
  const queryMap = new Map();
  const queries = query?.toString().split("+") ?? [query];
  for (const query of queries) {
    const subQuery = query?.toString().split(":") ?? "";
    queryMap.set(subQuery[0], subQuery[1]);
  }
  return queryMap;
};
const getQueryParams = (query) => {
  return {
    included: query
      .split(/[-]+[a-zA-Z0-9]+/i)
      .join("")
      .split(/[&]/i),
    excluded: query
      .split(/[&]+[a-zA-Z0-9]+|^[a-zA-Z0-9]+/gim)
      .join("")
      .split(/[-]/i),
  };
};

module.exports = {
  splitQuery,
  getQueryParams,
};
