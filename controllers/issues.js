const issuesService = require("../services/issuesService");
const tasks = require("../models/tasks");

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
    let issuesData = issues.data.length > 0 ? issues.data : [];
    issuesData = issuesData.map(async (issue) => {
      const taskData = await tasks.fetchTaskByIssueId(issue.id);
      issue.taskData = taskData;
      return issue;
    });
    const updatedIsuees = await Promise.all(issuesData);
    return res.json({
      message: "Issues returned successfully!",
      issues: updatedIsuees,
    });
  } catch (err) {
    logger.error(`Error while retriving issues ${err}`);
    return res.boom.badImplementation(ERROR_MESSAGE);
  }
};

module.exports = {
  getIssues,
};
