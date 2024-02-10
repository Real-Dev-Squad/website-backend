const githubService = require("../services/githubService");

const fetchMultiplePageResults = async (callbackFn, params) => {
  let page = 1;
  const allPRs = [];

  do {
    const { data } = await callbackFn({ page, ...params });
    const currentPRs = githubService.extractPRdetails(data);
    allPRs.push(...currentPRs);
    page++;
  } while (allPRs.length === 100 && allPRs.length > 0);

  return allPRs;
};

module.exports = {
  fetchMultiplePageResults,
};
