const firestore = require("../utils/firestore");
const flagModel = firestore.collection("featureFlags");

/**
 * Model function to add flagData in featureFlags collection of linked firestore
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

module.exports = {
  addFlag,
};
