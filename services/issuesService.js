const githubService = require("./githubService");
/**
 * Get the contributions of the user
 * @param {string} username
 */

const getRepoIssues = async () => {
  const data = await githubService.fetchIssues();
  return data;
};

module.exports = {
  getRepoIssues,
};
