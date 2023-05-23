const { Conflict, NotFound } = require("http-errors");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");
const { RESPONSE_MESSAGES, TYPE_MAP } = require("../constants/progresses");
const {
  buildQueryToFetchDocs,
  getProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
  assertUserOrTaskExists,
  buildQueryForPostingProgress,
  assertTaskExists,
  getProgressDateTimestamp,
  buildQueryToSearchProgressByDay,
} = require("../utils/progresses");
const { PROGRESS_ALREADY_CREATED, PROGRESS_DOCUMENT_NOT_FOUND } = RESPONSE_MESSAGES;

/**
 * Adds a new progress document for the given user or task, with a limit of one progress document per day.
 * @param progressData {object} The data to be added. It should be an object containing key-value pairs of the fields to be added, including a "type" field set to either "user" or "task".
 * @returns {Promise<object>} A Promise that resolves with the added progress document object, or rejects with an error object if the add operation fails.
 * @throws {Error} If a progress document has already been created for the given user or task on the current day.
 **/
const createProgressDocument = async (progressData) => {
  const { type, taskId } = progressData;
  const createdAtTimestamp = new Date().getTime();
  const progressDateTimestamp = getProgressDateTimestamp();
  if (taskId) {
    await assertTaskExists(taskId);
  }
  const query = buildQueryForPostingProgress(progressData);
  const existingDocumentSnapshot = await query.where("date", "==", progressDateTimestamp).get();
  if (!existingDocumentSnapshot.empty) {
    throw new Conflict(`${type.charAt(0).toUpperCase() + type.slice(1)} ${PROGRESS_ALREADY_CREATED}`);
  }
  const progressDocumentData = { ...progressData, createdAt: createdAtTimestamp, date: progressDateTimestamp };
  const { id } = await progressesCollection.add(progressDocumentData);
  return { id, ...progressDocumentData };
};

/**
 * This function retrieves the progress document for a specific user or task, or for all users or all tasks if no specific user or task is provided.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - type, userId, taskId.
 * @returns {Promise<object>} A Promise that resolves with the progress document objects.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getProgressDocument = async (queryParams) => {
  await assertUserOrTaskExists(queryParams);
  const query = buildQueryToFetchDocs(queryParams);
  const progressDocs = await getProgressDocs(query);
  return progressDocs;
};

/**
 * This function fetches the progress records for a particular user or task within the specified date range, from start to end date.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - userId, taskId, startDate, and endDate.
 * @returns {Promise<object>} A Promise that resolves with the progress records of the queried user or task.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getRangeProgressData = async (queryParams) => {
  const { startDate, endDate } = queryParams;
  await assertUserOrTaskExists(queryParams);
  const query = buildRangeProgressQuery(queryParams);
  const progressRecords = await getProgressRecords(query, queryParams);
  return {
    startDate,
    endDate,
    progressRecords,
  };
};

/**
 * This function fetches the progress records for a particular user or task on the specified date.
 * @param pathParams {object} This is the data that will be used for querying the db. It should contain type, typeId and date
 * @returns {Promise<object>} A Promise that resolves with the progress records of the queried user or task.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
async function getProgressByDate(pathParams) {
  const { type, typeId, date } = pathParams;
  await assertUserOrTaskExists({ [TYPE_MAP[type]]: typeId });
  const query = buildQueryToSearchProgressByDay({ [TYPE_MAP[type]]: typeId, date });
  const result = await query.get();
  if (!result.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const doc = result.docs[0];
  return { id: doc.id, ...doc.data() };
}

module.exports = { createProgressDocument, getProgressDocument, getRangeProgressData, getProgressByDate };
