const profileDiffsQuery = require("../models/profileDiffs");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Fetches the pending profile diffs
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getProfileDiffs = async (req, res) => {
  try {
    const pendingProfileDiffs = await profileDiffsQuery.fetchProfileDiffs();

    return res.json({
      message: "Profile Diffs returned successfully!",
      profileDiffs: pendingProfileDiffs,
    });
  } catch (error) {
    logger.error(`Error while fetching profile diffs: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getProfileDiffs,
};
