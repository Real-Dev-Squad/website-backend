const firestore = require("../utils/firestore");
const externalAccountsModel = firestore.collection("external-accounts");

const addExternalAccountData = async (data) => {
  try {
    await externalAccountsModel.add(data);
    return { message: "Added data successfully" };
  } catch (err) {
    logger.error("Error in adding data", err);
    throw err;
  }
};

module.exports = { addExternalAccountData };
