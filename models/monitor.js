const { Conflict, NotFound } = require("http-errors");
const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");
const { assertUserOrTaskExists } = require("../utils/progresses");
const { buildQueryByTypeId, buildQueryForFetchingDocsOfType, getTrackedProgressDocs } = require("../utils/monitor");
const { RESPONSE_MESSAGES } = require("../constants/monitor");
const { RESOURCE_NOT_FOUND, RESOURCE_ALREADY_TRACKED } = RESPONSE_MESSAGES;

/**
 * Creates a tracked progress document based on the provided data.
 * If a document with the same userId and taskId already exists,
 * a Conflict error is thrown.
 *
 * @param {Object} documentData - The data for creating the tracked progress document.
 * @param {string} documentData.userId - The ID of the user associated with the tracked progress.
 * @param {string} documentData.taskId - The ID of the task associated with the tracked progress.
 * @param {number} [documentData.frequency=1] - The frequency of tracking (optional, default: 1).
 * @param {boolean} documentData.marked - Indicates if the user/task is currently being marked for tracking.
 * @returns {Object} - The created tracked progress document with additional ID and timestamps.
 * @throws {Conflict} - If a document with the same userId and taskId already exists.
 */
const createTrackedProgressDocument = async (documentData) => {
  const { userId, taskId } = documentData;
  await assertUserOrTaskExists({ userId, taskId });
  const query = buildQueryByTypeId({ userId, taskId });
  const existingDocumentSnapshot = await query.get();
  if (!existingDocumentSnapshot.empty) {
    throw new Conflict(RESOURCE_ALREADY_TRACKED);
  }
  const timeNow = new Date().toISOString();
  // if not passed, the default frequency of 1 will be used as the frequency
  if (!documentData.frequency) documentData.frequency = 1;
  const docDataWithTimestamp = { ...documentData, createdAt: timeNow, updatedAt: timeNow };
  const { id } = await trackedProgressesCollection.add(docDataWithTimestamp);
  return { id, ...docDataWithTimestamp };
};

/**
 * Updates a tracked progress document based on the provided request data.
 * The document to update is determined by the type and typeId parameters from the request parameters.
 * If the document is not found, a NotFound error is thrown.
 *
 * @param {Object} req - The request object containing the parameters and body data.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.type - The type of the tracked progress document (e.g., "user", "task").
 * @param {string} req.params.typeId - The ID associated with the type (e.g., userId, taskId).
 * @param {Object} req.body - The data to update the tracked progress document.
 * @param {number} [req.body.frequency] - The frequency of tracking (optional).
 * @param {boolean} [req.body.marked] - Indicates if the user/task is currently being marked for tracking.(optional).
 * @returns {Object} - The updated tracked progress document with additional ID and merged data.
 * @throws {NotFound} - If the tracked progress document is not found.
 */

const updateTrackedProgressDocument = async (req) => {
  const { type, typeId } = req.params;
  const updatedData = { type, [`${type}Id`]: typeId };
  const query = buildQueryByTypeId(updatedData);
  const existingDocumentSnapshot = await query.get();
  if (existingDocumentSnapshot.empty) {
    throw new NotFound(RESOURCE_NOT_FOUND);
  }
  const doc = existingDocumentSnapshot.docs[0];
  const docId = doc.id;
  const docData = { ...req.body, updatedAt: new Date().toISOString() };
  await trackedProgressesCollection.doc(docId).update(docData);
  return { id: docId, ...doc.data(), ...docData };
};

/**
 * Retrieves either a single document or list of documents based on the provided query parameters.
 *
 * @param {Object} reqQuery - The query parameters for fetching tracked progress document(s).
 * @returns {Object| Array} - The tracked progress document or list of tracked documents matching the query.
 * @throws {NotFound} - If the tracked progress document is not found.
 */

const getTrackedProgressDocuments = async (reqQuery) => {
  let query;
  let docsData;
  const { userId, taskId } = reqQuery;
  if (userId || taskId) {
    await assertUserOrTaskExists({ userId, taskId });
    query = buildQueryByTypeId(reqQuery);
    docsData = (await getTrackedProgressDocs(query))[0];
  } else {
    query = buildQueryForFetchingDocsOfType(reqQuery);
    docsData = await getTrackedProgressDocs(query);
  }
  return docsData;
};

module.exports = {
  createTrackedProgressDocument,
  updateTrackedProgressDocument,
  getTrackedProgressDocuments,
};
