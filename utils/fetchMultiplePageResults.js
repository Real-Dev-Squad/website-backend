const githubService = require("../services/githubService");

const fetchMultiplePageResults = async (callbackFn, params) => {
  let page = 1;
  const { data } = await callbackFn({ page, ...params });

  const allPRs = githubService.extractPRdetails(data);
  page++;

  while (allPRs.length === 100) {
    const { data } = await callbackFn({ page, ...params });
    const nextPRs = githubService.extractPRdetails(data);
    allPRs.push(...nextPRs);
    page++;
  }

  return allPRs;
};

module.exports = {
  fetchMultiplePageResults,
};
