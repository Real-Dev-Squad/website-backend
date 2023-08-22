const userQuery = require("../models/userMigrations");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Returns the lists of usernames where default colors were added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultColors = async (req, res) => {
  try {
    const usersDetails = await userQuery.addDefaultColors();

    return res.json({
      message: "User colors updated successfully!",
      usersDetails,
    });
  } catch (error) {
    logger.error(`Error adding default colors to users: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  addDefaultColors,
};
