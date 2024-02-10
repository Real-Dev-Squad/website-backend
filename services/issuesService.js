const githubService = require("./githubService");
/**
 * Get the contributions of the user
 * @param {string} username
 */

const getOrgIssues = async () => {
  const data = await githubService.fetchIssues();
  return data;
};

const searchOrgIssues = async (searchString) => {
  const data = await githubService.fetchOpenIssues({
    searchString,
  });

  return data;
};

module.exports = {
  getOrgIssues,
  searchOrgIssues,
};
