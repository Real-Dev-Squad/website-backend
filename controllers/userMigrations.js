const userQuery = require("../models/userMigrations");
const logger = require("../utils/logger");
const cardColorIdArray = require("../constants/cardColorIdArray");
const { getRandomIndex } = require("../utils/helpers");
/**
 * Returns the lists of usernames where default colors were added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultColors = async (req, res) => {
  try {
    const { usersArr, userModel } = await userQuery.addDefaultColors();
    const migratedUsers = [];
    const updateUserPromises = [];

    for (const user of usersArr) {
      const colors = user.colors ? user.colors : {};
      if (user.colors === undefined) {
        const userColorIndex = getRandomIndex(cardColorIdArray.length);
        colors.color_id = userColorIndex;
        updateUserPromises.push(userModel.doc(user.id).set({ ...user, colors }));
        migratedUsers.push(user.username);
      }
    }

    await Promise.all(updateUserPromises);
    // eslint-disable-next-line no-console

    return res.json({
      message: "User colors updated successfully!",
      usersDetails: { count: migratedUsers.length, users: migratedUsers },
    });
  } catch (error) {
    logger.error(`Error adding default colors to users: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

module.exports = {
  addDefaultColors,
};
