const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const { getRandomIndex } = require("../utils/helpers");
const USER_COLORS = 10;
const MAX_TRANSACTION_WRITES = 499;

/**
 * Returns the object with details about users to whom user color was added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultColors = async () => {
  try {
    const usersSnapshot = await userModel.get();
    const usersArr = [];

    usersSnapshot.forEach((doc) => usersArr.push({ id: doc.id, ...doc.data() }));

    const batchArray = [];
    const users = [];
    batchArray.push(firestore.batch());
    let operationCounter = 0;
    let batchIndex = 0;
    let totalCount = 0;

    for (const user of usersArr) {
      const colors = user.colors ?? {};
      if (!user.colors) {
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

    return {
      totalUsersFetched: usersArr.length,
      totalUsersUpdated: totalCount,
      totalUsersUnaffected: usersArr.length - totalCount,
    };
  } catch (err) {
    logger.error("Error adding default colors to users", err);
    throw err;
  }
};

module.exports = {
  addDefaultColors,
};
