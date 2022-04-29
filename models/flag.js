const firestore = require("../utils/firestore");
const flagModel = firestore.collection("featureFlags");

/**
 *
 * @param flagData { Object }: flag data object to be stored in DB
 * @returns Flag Id: String
 */
const addFlag = async (flagData) => {
  try {
    const flag = await flagModel.add(flagData);
    return flag.id;
  } catch (err) {
    logger.error("Error in adding flag", err);
    throw err;
  }
};

const fetchFlags = async () => {
  try {
    const flag = await flagModel.get();
    const flags = [];
    flag.forEach((doc) => {
      const flagdata = doc.data();
      flags.push({
        id: doc.id,
        ...flagdata,
      });
    });
    return flags;
  } catch (err) {
    logger.error("Error retrieving members data", err);
    throw err;
  }
};

module.exports = {
  addFlag,
  fetchFlags,
};
