const userQuery = require("../models/migrations");
const logger = require("../utils/logger");

/**
 * Returns the lists of usernames where default colors were added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultColors = async (req, res) => {
  try {
    const addedDefaultColorsData = await userQuery.addDefaultColors();

    return res.json({
      message: "User colors updated successfully!",
      ...addedDefaultColorsData,
    });
  } catch (error) {
    logger.error(`Error adding default colors to users: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

module.exports = {
  addDefaultColors,
};
