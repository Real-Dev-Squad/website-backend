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

const fetchExternalAccountData = async (query, param) => {
  try {
    const userExternalAccountData = [];
    let externalAccountData;

    externalAccountData = externalAccountsModel.where("token", "==", param);
    if (query && query?.type) {
      externalAccountData = externalAccountData.where("type", "==", query?.type);
    }

    const querySnapshot = await externalAccountData.limit(1).get();
    if (querySnapshot.empty) {
      return userExternalAccountData;
    }

    const data = querySnapshot.docs[0];
    userExternalAccountData.push({
      id: data.id,
      ...data.data(),
    });

    return userExternalAccountData;
  } catch (err) {
    logger.error("Error in fetching external account data", err);
    throw err;
  }
};

module.exports = { addExternalAccountData, fetchExternalAccountData };
