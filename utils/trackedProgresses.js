const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");

/**
 * Builds a Firestore query to check if a document exists based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for checking if a document exists.
 * @param {string} queryParams.userId - The ID of the user (optional).
 * @param {string} queryParams.taskId - The ID of the task (optional).
 * @returns {Firestore.Query} - A Firestore query to check if a document exists.
 */
const buildQueryToCheckIfDocExists = (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    return trackedProgressesCollection.where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("taskId", "==", taskId);
  }
};

/**
 * Builds a Firestore query for fetching tracked progress documents of a specific type based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for fetching tracked progress documents.
 * @param {string} queryParams.type - The type of tracked progress documents.
 * @param {boolean} queryParams.currentlyTracked - The flag indicating if the documents are marked (optional).
 * @returns {Firestore.Query} - A Firestore query for fetching tracked progress documents of a specific type.
 */
const buildQueryForFetchingDocsOfType = (queryParams) => {
  const { type, marked: currentlyTracked } = queryParams;
  let query = trackedProgressesCollection.where("type", "==", type);
  if (currentlyTracked !== undefined) {
    query = query.where("currentlyTracked", "==", currentlyTracked);
  }
  return query;
};

/**
 * Builds a Firestore query for fetching a specific tracked progress document based on the provided query parameters.
 *
 * @param {Object} queryParams - The query parameters for fetching a specific tracked progress document.
 * @param {string} queryParams.type - The type of the tracked progress document.
 * @param {string} queryParams.typeId - The ID associated with the type (userId for "user", taskId for "task").
 * @returns {Firestore.Query} - A Firestore query for fetching a specific tracked progress document.
 */
const buildQueryForFetchingSpecificDoc = (queryParams) => {
  const { type, typeId } = queryParams;
  const query = trackedProgressesCollection.where("type", "==", type);
  if (type === "user") {
    return query.where("userId", "==", typeId);
  } else {
    return query.where("taskId", "==", typeId);
  }
};

module.exports = { buildQueryToCheckIfDocExists, buildQueryForFetchingDocsOfType, buildQueryForFetchingSpecificDoc };
