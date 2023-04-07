const githubService = require("../services/githubService");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUserPRs = async (req, res) => {
  try {
    const { data } = await githubService.fetchPRsByUser(req.params.username);

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data);
      return res.json({
        message: "Pull requests returned successfully!",
        pullRequests: allPRs,
      });
    }
    return res.json({
      message: "No pull requests found!",
      pullRequests: [],
    });
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Get stale PRs in open state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getStalePRs = async (req, res) => {
  try {
    const { size, page } = req.query;
    const { data } = await githubService.fetchStalePRs(size, page);

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data);
      return res.json({
        message: "Stale PRs",
        pullRequests: allPRs,
      });
    }
    return res.json({
      message: "No pull requests found!",
      pullRequests: [],
    });
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Get Latest PRs in open state for Real Dev Squad repos
 *
 * @param {Object} req
 * @param {Object} res
 * @todo create cache for RDS usernames <> github usernames
 */
const getOpenPRs = async (req, res) => {
  try {
    const { size, page } = req.query;
    const { data } = await githubService.fetchOpenPRs(size, page);

    if (data.total_count) {
      const allPRs = githubService.extractPRdetails(data);
      return res.json({
        message: "Open PRs",
        pullRequests: allPRs,
      });
    }
    return res.json({
      message: "No pull requests found!",
      pullRequests: [],
    });
  } catch (err) {
    logger.error(`Error while processing pull requests: ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getUserPRs,
  getStalePRs,
  getOpenPRs,
};
