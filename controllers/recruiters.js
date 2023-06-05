const recruiterQuery = require("../models/recruiters");
const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Posts the data about the recruiter
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addRecruiter = async (req, res) => {
  try {
    const result = await recruiterQuery.addRecruiterInfo(req.body, req.params.username);
    if (!result) {
      return res.boom.notFound("User doesn't exist");
    }
    return res.json({
      message: "Request Submission Successful!!",
      result,
    });
  } catch (error) {
    logger.error(`Error while adding recruiterInfo: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetch all the recruiters information
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchRecruitersInfo = async (req, res) => {
  try {
    const allRecruiter = await recruiterQuery.fetchRecruitersInfo();
    return res.json({
      message: "Recruiters returned successfully!",
      recruiters: allRecruiter.length > 0 ? allRecruiter : [],
    });
  } catch (error) {
    logger.error(`Error while fetching recruiters: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  addRecruiter,
  fetchRecruitersInfo,
};
