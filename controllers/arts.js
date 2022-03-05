const arts = require("../models/arts");

/**
 * Adds art
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addArt = async (req, res) => {
  try {
    await arts.addArt({ ...req.body, userId: req.userData.id });

    return res.json({
      message: "Art successfully added!",
    });
  } catch (error) {
    logger.error(`Error adding art: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

/**
 * Update art
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateArt = async (req, res) => {
  try {
    await arts.updateArt({ ...req.body, userId: req.userData.id });
    return res.json({
      message: "Art successfully updated!",
    });
  } catch (error) {
    logger.error(`Error in udpating art: ${error}`);
    return res.boom.serverUnavailable("Something went worng please contact admin");
  }
};

/**
 * Fetches all arts irrespective of user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchArts = async (req, res) => {
  try {
    const allArt = await arts.fetchArts();
    return res.json({
      message: allArt.length > 0 ? "Arts returned successfully!" : "No arts found",
      arts: allArt.length > 0 ? allArt : [],
    });
  } catch (err) {
    logger.error(`Error while fetching arts ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Fetches all the arts of the user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfArts = async (req, res) => {
  try {
    const { id } = req.userData;
    const userArts = await arts.fetchUserArts(id);
    return res.json({
      message: userArts.length > 0 ? "User arts returned successfully!" : "No arts found",
      userArts,
    });
  } catch (err) {
    logger.error(`Error while getting user arts ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addArt,
  updateArt,
  fetchArts,
  getSelfArts,
};
