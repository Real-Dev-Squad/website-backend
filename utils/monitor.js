const { NotFound } = require("http-errors");
const fireStore = require("./firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");
const { RESPONSE_MESSAGES } = require("../constants/monitor");
const { RESOURCE_NOT_FOUND } = RESPONSE_MESSAGES;

/**
 * Builds a Firestore query based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for checking if a document exists.
 * @param {string} queryParams.userId - The ID of the user (optional).
 * @param {string} queryParams.taskId - The ID of the task (optional).
 * @returns {Firestore.Query} - A Firestore query to check if a document exists.
 */
const buildTrackedProgressQueryByType = (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    return trackedProgressesCollection.where("type", "==", "user").where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("type", "==", "task").where("taskId", "==", taskId);
  }
};

/**
 * Builds a Firestore query for fetching tracked progress documents of a specific type based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for fetching tracked progress documents.
 * @param {string} queryParams.type - The type of tracked progress documents.
 * @param {boolean} queryParams.monitored - The flag indicating if the documents are marked (optional).
 * @returns {Firestore.Query} - A Firestore query for fetching tracked progress documents of a specific type.
 */
const buildQueryForFetchingDocsOfType = (queryParams) => {
  const { type, monitored } = queryParams;
  let query = trackedProgressesCollection.where("type", "==", type);
  if (monitored !== undefined) {
    query = query.where("monitored", "==", JSON.parse(monitored));
  }
  return query;
};

/**
 * Builds a Firestore query for fetching a specific tracked progress document based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for fetching a specific tracked progress document.
 * @param {string} queryParams.userId - The userId of the tracked progress document
 * @param {string} queryParams.taskId - The taskId of the tracked progress document
 * @returns {Firestore.Query} - A Firestore query for fetching a specific tracked progress document.
 */
const buildQueryToFetchTrackedDoc = (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    return trackedProgressesCollection.where("type", "==", "user").where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("type", "==", "task").where("taskId", "==", taskId);
  }
};

/**
 * Retrieves progress documents from Firestore based on the given query.
 * @param {Query} query - A Firestore query object for fetching progress documents.
 * @returns {Array.<Object>} An array of objects representing the retrieved tracked progress documents. Each object contains the document ID and its data.
 * @throws {NotFound} If no progress documents are found based on the given query.
 */
const getTrackedProgressDocs = async (query) => {
  const progressesDocs = await query.get();
  if (!progressesDocs.size) {
    throw new NotFound(RESOURCE_NOT_FOUND);
  }
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push({ id: doc.id, ...doc.data() });
  });
  return docsData;
};

module.exports = {
  buildTrackedProgressQueryByType,
  buildQueryForFetchingDocsOfType,
  getTrackedProgressDocs,
  buildQueryToFetchTrackedDoc,
};
