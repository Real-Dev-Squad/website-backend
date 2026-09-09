const firestore = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");

const chaincodeModel = firestore.collection("chaincodes");
const storeChaincode = async (userId) => {
  try {
    const userChaincode = await chaincodeModel.add({
      userId,
      timestamp: Timestamp.fromDate(new Date()),
    });
    return userChaincode.id;
  } catch (error) {
    logger.error("Error in creating chaincode", error);
    throw error;
  }
};

module.exports = {
  storeChaincode,
};
