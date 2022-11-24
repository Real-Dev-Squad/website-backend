const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extension-requests");
const userUtils = require("../utils/users");
const { ETA_EXTENSION_REQUEST_STATUS } = require("../constants/extensionRequests");
const { buildExtensionRequests, fromFirestoreData } = require("../utils/extensionRequests");

/**
 * Fetch all Extension Requests of a user
 *
 * @return {Promise<extensionRequests|Array>}
 */

const fetchUserExtensionRequests = async (username, statuses = [], taskId) => {
  try {
    const userId = await userUtils.getUserId(username);

    if (!userId) {
      return { userNotFound: true };
    }

    let extensionRequestsSnapshot = [];

    if (statuses && statuses.length) {
      if (taskId) {
        extensionRequestsSnapshot = await extensionRequestsModel
          .where("assignee", "==", userId)
          .where("taskId", "==", taskId)
          .where("status", "in", statuses)
          .get();
        // order can be added to above query
      } else {
        extensionRequestsSnapshot = await extensionRequestsModel
          .where("assignee", "==", userId)
          .where("status", "in", statuses)
          .get();
      }
    } else {
      if (taskId) {
        extensionRequestsSnapshot = await extensionRequestsModel
          .where("assignee", "==", userId)
          .where("taskId", "==", taskId)
          .get();
      } else {
        extensionRequestsSnapshot = await extensionRequestsModel.where("assignee", "==", userId).get();
      }
    }

    const extensionRequests = buildExtensionRequests(extensionRequestsSnapshot);

    const promises = extensionRequests.map(async (extensionRequest) => fromFirestoreData(extensionRequest));
    const updatedExtensionRequests = await Promise.all(promises);
    const extensionRequestList = updatedExtensionRequests.map((extensionRequest) => {
      extensionRequest.status =
        ETA_EXTENSION_REQUEST_STATUS[extensionRequest.status.toUpperCase()] || extensionRequest.status;
      return extensionRequest;
    });
    return extensionRequestList;
  } catch (error) {
    logger.error("error getting extension requests", error);
    throw error;
  }
};

module.exports = {
  fetchUserExtensionRequests,
};
