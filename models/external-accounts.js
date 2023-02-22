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
    let externalAccountQuery;
    let data, id;

    externalAccountQuery = externalAccountsModel.where("token", "==", param);
    if (query && query?.type) {
      externalAccountQuery = externalAccountQuery.where("type", "==", query?.type);
    }

    const querySnapshot = await externalAccountQuery.limit(1).get();

    const doc = querySnapshot.docs[0];
    if (doc) {
      id = doc.id;
      data = doc.data();
    }

    return {
      id: id,
      ...data,
    };
  } catch (err) {
    logger.error("Error in fetching external account data", err);
    throw err;
  }
};

module.exports = { addExternalAccountData, fetchExternalAccountData };
