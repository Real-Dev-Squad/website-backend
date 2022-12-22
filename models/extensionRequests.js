const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extensionRequests");
const { buildExtensionRequests, formatExtensionRequest } = require("../utils/extensionRequests");

/**
 * Create Extension Request
 * @param extensionRequestData { Object }: Body of the extension request
 */
const createExtensionRequest = async (extensionRequestData) => {
  try {
    const request = {
      timestamp: (new Date().getTime() / 1000).toFixed(0),
      ...extensionRequestData,
    };
    return await extensionRequestsModel.add(request);
  } catch (err) {
    logger.error("Error in adding extension requests", err);
    throw err;
  }
};

/**
 * Updates Extension Request
 *
 * @param extensionRequestData { Object }: extension request data object to be stored in DB
 * @param extensionRequestId { string }: extensionRequestId which will be used to update the task in DB
 * @return {extensionRequestResult : Object}
 */
const updateExtensionRequest = async (extensionRequestData, extensionRequestId) => {
  try {
    const extensionRequest = await extensionRequestsModel.doc(extensionRequestId).get();
    await extensionRequestsModel.doc(extensionRequestId).set({
      ...extensionRequest.data(),
      ...extensionRequestData,
    });
    return extensionRequestId;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

/**
 * Fetch all Extension Requests
 * @param extensionRequestquery { Object }: Body of the extension request
 * @return {Promise<ExtensionRequest|Array>}
 */
const fetchExtensionRequests = async (extensionRequestquery, userId = null) => {
  try {
    let extensionRequestsSnapshot = extensionRequestsModel;

    if (userId) {
      extensionRequestsSnapshot = extensionRequestsModel.where("assignee", "==", userId);
    }

    Object.entries(extensionRequestquery).forEach(([key, value]) => {
      if (value) extensionRequestsSnapshot = extensionRequestsSnapshot.where(key, "==", value);
    });

    extensionRequestsSnapshot = await extensionRequestsSnapshot.get();

    const requests = buildExtensionRequests(extensionRequestsSnapshot);
    const promises = requests.map((request) => formatExtensionRequest(request));
    const updatedRequests = await Promise.all(promises);

    return updatedRequests;
  } catch (err) {
    logger.error("error getting extension requests", err);
    throw err;
  }
};

const fetchExtensionRequest = async (extensionRequestId) => {
  try {
    const extensionRequest = await extensionRequestsModel.doc(extensionRequestId).get();
    const extensionRequestData = await formatExtensionRequest(extensionRequest.data());
    return { extensionRequestData };
  } catch (err) {
    logger.error("Error retrieving extension request data", err);
    throw err;
  }
};

module.exports = {
  createExtensionRequest,
  fetchExtensionRequests,
  fetchExtensionRequest,
  updateExtensionRequest,
};
