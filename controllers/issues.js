const issuesService = require("../services/issuesService");

const ERROR_MESSAGE = "Something went wrong. Please try again or contact admin";
/**
 * Get the  issues of the repo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getIssues = async (req, res) => {
  try {
    const repo = req.params.repo;
    const issues = await issuesService.getRepoIssues(repo);

    return res.json({
      message: "Issues returned successfully!",
      issues: issues.data.length > 0 ? issues.data : [],
    });
  } catch (err) {
    logger.error(`Error while retriving issues ${err}`);
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

module.exports = {
  getIssues,
};
