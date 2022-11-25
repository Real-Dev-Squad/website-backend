const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extension-requests");
const admin = require("firebase-admin");
const { getUsername } = require("../utils/users");
const { buildExtensionRequests } = require("../utils/extensionRequest");

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

/**
 * Fetch all tasks
 * @param extensionRequestquery { Object }: Body of the extension request
 * @return {Promise<tasks|Array>}
 */
const fetchExtensionRequests = async (extensionRequestquery) => {
  try {
    const { id: requestId, status } = extensionRequestquery;

    let extensionRequestsSnapshot;

    if (requestId && status) {
      extensionRequestsSnapshot = await extensionRequestsModel
        .where("taskId", "==", requestId)
        .where("status", "==", status)
        .get();
    } else if (status) {
      extensionRequestsSnapshot = await extensionRequestsModel.where("status", "==", status).get();
    } else if (requestId) {
      extensionRequestsSnapshot = await extensionRequestsModel.where("taskId", "==", requestId).get();
    } else extensionRequestsSnapshot = await extensionRequestsModel.get();

    const requests = buildExtensionRequests(extensionRequestsSnapshot);
    const promises = requests.map(async (request) => {
      return { ...request, assignee: await getUsername(request.assignee) };
    });
    const updatedRequests = await Promise.all(promises);

    return updatedRequests;
  } catch (err) {
    logger.error("error getting extension requests", err);
    throw err;
  }
};

module.exports = {
  createETAExtension,
  fetchExtensionRequests,
};
