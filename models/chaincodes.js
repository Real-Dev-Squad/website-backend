import firestore from "../utils/firestore.js";
import admin from "firebase-admin";
import logger from "../utils/logger.js";

const chaincodeModel = firestore.collection("chaincodes");

const storeChaincode = async (userId) => {
  try {
    const userChaincode = await chaincodeModel.add({
      userId,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return userChaincode.id;
  } catch (error) {
    logger.error("Error in creating chaincode", error);
    throw error;
  }
};

export { storeChaincode };
