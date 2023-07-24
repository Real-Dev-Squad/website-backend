const firestore = require("../utils/firestore");
const userQuery = require("../models/userMigrations");
const logger = require("../utils/logger");
const { getRandomIndex } = require("../utils/helpers");
const USER_COLORS = 10;
const MAX_TRANSACTION_WRITES = 499;

/**
 * Returns the lists of usernames where default colors were added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultColors = async (req, res) => {
  try {
    const { usersArr, userModel } = await userQuery.addDefaultColors();

    const batchArray = [];
    const users = [];
    batchArray.push(firestore.batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let totalCount = 0;

    for (const user of usersArr) {
      const colors = user.colors ?? {};
      if (user.colors === undefined) {
        const userColorIndex = getRandomIndex(USER_COLORS);
        colors.color_id = userColorIndex;
        const docId = userModel.doc(user.id);
        batchArray[parseInt(batchIndex)].set(docId, { ...user, colors });
        operationCounter++;
        totalCount++;
        users.push(user.username);
        if (operationCounter === MAX_TRANSACTION_WRITES) {
          batchArray.push(firestore.batch());
          batchIndex++;
          operationCounter = 0;
        }
      }
    }
    batchArray.forEach(async (batch) => await batch.commit());

    return res.json({
      message: "User colors updated successfully!",
      usersDetails: { count: totalCount, users },
    });
  } catch (error) {
    logger.error(`Error adding default colors to users: ${error}`);
    return res.boom.badImplementation("Something went wrong. Please contact admin");
  }
};

module.exports = {
  addDefaultColors,
};
