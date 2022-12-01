const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extensionRequests");
const { buildExtensionRequests, formatExtensionRequest } = require("../utils/extensionRequest");

/**
 * Create Extension Request
 * @param body { Object }: Body of the extension request
 */
const createETAExtension = async (body) => {
  try {
    const request = {
      timestamp: (new Date().getTime() / 1000).toFixed(0),
      ...body,
    };
    return await extensionRequestsModel.add(request);
  } catch (err) {
    logger.error("Error in adding extension requests", err);
    throw err;
  }
};

/**
 * Fetch all Extension Requests
 * @param extensionRequestquery { Object }: Body of the extension request
 * @return {Promise<ExtensionRequest|Array>}
 */
const fetchExtensionRequests = async (extensionRequestquery) => {
  try {
    let extensionRequestsSnapshot = extensionRequestsModel;

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
  createETAExtension,
  fetchExtensionRequests,
  fetchExtensionRequest,
};
