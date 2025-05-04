import { fetchPRsByUser, extractPRdetails, fetchOpenPRs } from "../services/githubService.js";
import { SOMETHING_WENT_WRONG } from "../constants/errorMessages.js";
import { ORDER_TYPE } from "../utils/pullRequests.js";
import logger from "../utils/logger.js";

/**
 * Collects all pull requests and sends only required data for each pull request
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

export const getUserPRs = async (req, res) => {
  try {
    const { data } = await fetchPRsByUser(req.params.username);

    if (data.total_count) {
      const allPRs = extractPRdetails(data);
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
export const getStalePRs = async (req, res) => {
  try {
    const order = ORDER_TYPE.ASC;
    const { size, page } = req.query;
    const { data } = await fetchOpenPRs({ perPage: size, page, resultOptions: { order } });

    if (data.total_count) {
      const allPRs = extractPRdetails(data);
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
export const getOpenPRs = async (req, res) => {
  try {
    const order = ORDER_TYPE.DESC;
    const { size, page } = req.query;
    const { data } = await fetchOpenPRs({ perPage: size, page, resultOptions: { order } });

    if (data.total_count) {
      const allPRs = extractPRdetails(data);
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
