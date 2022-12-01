const githubService = require("./githubService");
/**
 * Get the contributions of the user
 * @param {string} username
 */

const getRepoIssues = async (repo) => {
  const data = await githubService.fetchIssues(repo);
  return data;
};

module.exports = {
  getRepoIssues,
};
