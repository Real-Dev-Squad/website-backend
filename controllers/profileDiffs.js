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
    if (!req.query.dev) {
      const pendingProfileDiffs = await profileDiffsQuery.fetchProfileDiffs();

      return res.json({
        message: "Profile Diffs returned successfully!",
        profileDiffs: pendingProfileDiffs,
      });
    } else {
      const { status = "PENDING", order = "desc", size = 10, username = "", cursor = null } = req.query;
      const { profileDiffs, next } = await profileDiffsQuery.fetchProfileDiffsWithPagination(
        status,
        order,
        Number.parseInt(size),
        username,
        cursor
      );

      return res.json({
        message: "Profile Diffs returned successfully!",
        profileDiffs,
        next,
      });
    }
  } catch (error) {
    logger.error(`Error while fetching profile diffs: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const getProfileDiff = async (req, res) => {
  try {
    const result = await profileDiffsQuery.fetchProfileDiff(req.params.id);
    if (result.profileDiffExists) {
      return res.json({
        message: "Profile Diff returned successfully!",
        profileDiff: result,
      });
    }

    return res.boom.notFound("Profile Diff doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching Profile Diff: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  getProfileDiffs,
  getProfileDiff,
};
