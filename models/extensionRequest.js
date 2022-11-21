const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extension-requests");
const admin = require("firebase-admin");

/**
 * Create Extension Request
 * @param body { Object }: Body of the extension request
 */
const createETAExtension = async (body) => {
  try {
    const request = {
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      body,
    };
    return await extensionRequestsModel.add(request);
  } catch (err) {
    logger.error("Error in adding log", err);
    throw err;
  }
};

module.exports = {
  createETAExtension,
};
