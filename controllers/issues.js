const issuesService = require("../services/issuesService");
const tasks = require("../models/tasks");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const githubService = require("../services/githubService");

/**
 * Get the issues of the repo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getIssues = async (req, res) => {
  try {
    const { q: queryString } = req.query;
    let issues = {};
    const githubOrg = config.get("githubApi.org");
    const githubIssuerUrlPattern = new RegExp(`^https://github.com/${githubOrg}/.+/issues/\\d+$`);

    if (githubIssuerUrlPattern.test(queryString)) {
      const url = new URL(queryString);
      const issueUrlPaths = url.pathname.split("/");
      const repositoryName = issueUrlPaths[2];
      const issueNumber = issueUrlPaths[4];
      issues.data = [await githubService.fetchIssuesById(repositoryName, issueNumber)];
    } else if (queryString) {
      const searchedIssues = await issuesService.searchOrgIssues(queryString);
      issues.data = searchedIssues?.data?.items ?? [];
    } else {
      issues = await issuesService.getOrgIssues();
    }

    let issuesData = issues.data.length > 0 ? issues.data : [];
    issuesData = issuesData.filter((issue) => !Object.keys(issue).includes("pull_request"));
    issuesData = issuesData.map(async (issue) => {
      const taskData = await tasks.fetchTaskByIssueId(issue.id);
      if (taskData) {
        issue.taskExists = true;
        issue.taskId = taskData.id;
      }

      return issue;
    });
    const updatedIsuees = await Promise.all(issuesData);
    return res.json({
      message: "Issues returned successfully!",
      issues: updatedIsuees,
    });
  } catch (err) {
    logger.error(`Error while retriving issues ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Receive updated issue information from webhook
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const issueUpdates = async (req, res) => {
  try {
    const response = req.body;
    if ("issue" in response) {
      const { issue } = response;
      const taskData = await tasks.fetchTaskByIssueId(issue.id);
      if (taskData) {
        // filtering properties with undefined or null values
        const updatedTaskData = Object.fromEntries(Object.entries(taskData).filter(([_, value]) => value ?? false));

        updatedTaskData.title = issue.title;
        updatedTaskData.github = {
          issue: {
            ...updatedTaskData.github.issue,
            status: issue.state,
          },
        };

        // If the issue has any updates with the assignee
        if (issue.assignee) {
          // If there are no previous assignees or the task was not assigned before
          if (!updatedTaskData.github.issue.assignee || !updatedTaskData.assignee) {
            updatedTaskData.github.issue.assignee = issue.assignee.login;
          }
        }
        // If the issue assignee was removed and task was not assigned
        else if (updatedTaskData.github.issue.assignee && !updatedTaskData.assignee) {
          delete updatedTaskData.github.issue.assignee;
        }

        if (issue.state === "closed") {
          updatedTaskData.github.issue.closedAt = issue.closed_at;
        }

        await tasks.updateTask(updatedTaskData, taskData.id);
        return res.json({
          message: "Task updated successfully",
        });
      } else {
        return res.json({
          message: "No task was found for the updated issue",
        });
      }
    }
    return res.json({
      message: "No issue was updated",
    });
  } catch (err) {
    logger.error(`Error while retriving issues ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getIssues,
  issueUpdates,
};
