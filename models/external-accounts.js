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
    externalAccountData = await externalAccountsModel.where("token", "==", param);

    Object.keys(query).forEach((key) => {
      if (key === "type") {
        externalAccountData = externalAccountData.where(key, "==", query?.key);
      }
    });

    externalAccountData = await externalAccountData.limit(1).get();

    externalAccountData.forEach((data) => {
      userExternalAccountData.push({
        id: data.id,
        ...data.data(),
      });
    });

    return userExternalAccountData;
  } catch (err) {
    logger.error("Error in fetching external account data", err);
    throw err;
  }
};

module.exports = { addExternalAccountData, fetchExternalAccountData };
