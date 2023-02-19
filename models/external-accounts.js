const firestore = require("../utils/firestore");
const extAccountsModel = firestore.collection("external-accounts");

const addExternalAccountData = async (data) => {
  try {
    await extAccountsModel.add(data);
    return { message: "Added data successfully" };
  } catch (err) {
    logger.error("Error in adding data", err);
    throw err;
  }
};

module.exports = { addExternalAccountData };
