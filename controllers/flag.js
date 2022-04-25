const flagQuery = require("../models/flag");

/**
 * Controller function to add feature flag data to firestore
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

module.exports = {
  addFlag,
};
