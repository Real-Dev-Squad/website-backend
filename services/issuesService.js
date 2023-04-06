const githubService = require("./githubService");
/**
 * Get the contributions of the user
 * @param {string} username
 */

const getOrgIssues = async () => {
  const data = await githubService.fetchIssues();
  return data;
};

module.exports = {
  getOrgIssues,
};
