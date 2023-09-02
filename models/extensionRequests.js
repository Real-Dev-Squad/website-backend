const firestore = require("../utils/firestore");
const extensionRequestsModel = firestore.collection("extensionRequests");
const { buildExtensionRequests, formatExtensionRequest, generateNextLink } = require("../utils/extensionRequests");

/**
 * Create Extension Request
 * @param extensionRequestData { Object }: Body of the extension request
 */
const createExtensionRequest = async (extensionRequestData) => {
  try {
    const request = {
      timestamp: Number((new Date().getTime() / 1000).toFixed(0)),
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
 * @param extensionRequestQuery { Object }: Body of the extension request
 * @param extensionRequestQuery.status {string} : STATUS of the extension request
 * @param extensionRequestQuery.assignee {string} : assignee of the extension request
 * @param extensionRequestQuery.taskId {string} : taskId of the extension request
 * @return Array of Extension Requests {Promise<ExtensionRequestsArray|Array>}
 */
const fetchExtensionRequests = async (extensionRequestQuery) => {
  try {
    let extensionRequestsSnapshot = extensionRequestsModel;

    Object.entries(extensionRequestQuery).forEach(([key, value]) => {
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

/**
 * Fetch all Extension Requests
 * @param extensionRequestQuery { Object }: Body of the extension request
 * @param extensionRequestQuery.status {string} : STATUS of the extension request
 * @param extensionRequestQuery.assignee {string} : assignee of the extension request
 * @param extensionRequestQuery.taskId {string} : taskId of the extension request
 * @param paginationQuery.cursor {string} : Id of the extension request
 * @param paginationQuery.size {number} : maximum number of items in response
 * @param paginationQuery.order {string} : order for timestamp/created time
 * @return Array of Extension Requests {Promise<ExtensionRequestsArray|Array>}
 */
const fetchPaginatedExtensionRequests = async (extensionRequestQuery, paginationQuery) => {
  try {
    let extensionRequestsSnapshot = extensionRequestsModel;

    Object.entries(extensionRequestQuery).forEach(([key, value]) => {
      if (value) {
        const opStr = Array.isArray(value) ? "in" : "==";
        extensionRequestsSnapshot = extensionRequestsSnapshot.where(key, opStr, value);
      }
    });

    const { cursor, size, order } = paginationQuery;

    if (order) {
      extensionRequestsSnapshot = extensionRequestsSnapshot.orderBy("timestamp", order);
    }

    if (cursor) {
      const data = await extensionRequestsModel.doc(cursor).get();
      extensionRequestsSnapshot = extensionRequestsSnapshot.startAfter(data).limit(size);
    } else if (size) {
      extensionRequestsSnapshot = extensionRequestsSnapshot.limit(size);
    }

    extensionRequestsSnapshot = await extensionRequestsSnapshot.get();

    const requests = buildExtensionRequests(extensionRequestsSnapshot);
    const promises = requests.map((request) => formatExtensionRequest(request));
    const updatedRequests = await Promise.all(promises);

    const resultDataLength = extensionRequestsSnapshot.docs.length;
    const isNextLinkRequired = size && resultDataLength === size;
    const lastVisible = isNextLinkRequired && extensionRequestsSnapshot.docs[resultDataLength - 1];

    const nextPageParams = {
      ...extensionRequestQuery,
      ...paginationQuery,
      cursor: lastVisible?.id,
    };

    let nextLink = "";
    if (lastVisible) {
      nextLink = generateNextLink(nextPageParams);
    }

    return { allExtensionRequests: updatedRequests, next: nextLink };
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
  fetchPaginatedExtensionRequests,
};
