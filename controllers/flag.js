const flagQuery = require("../models/flag");

/**
 * Adds art
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const addFlag = async (req, res) => {
  try {
    const flagId = await flagQuery.addFlag(req.body);
    return res.json({
      message: "Add feature flag successfully!",
      flagId: flagId,
    });
  } catch (err) {
    logger.error(`Error while adding featureFlag info: ${err}`);
    return res.boom.badImplementation("Something went wrong please contact admin");
  }
};
const fetchFlags = async (req, res) => {
  try {
    const flags = await flagQuery.fetchFlags();
    return res.json({
      message: flags.length ? "Flags returned successfully!" : "No flag found",
      flags,
    });
  } catch (error) {
    logger.error(`Error while fetching all Flags: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

module.exports = {
  addFlag,
  fetchFlags,
};
