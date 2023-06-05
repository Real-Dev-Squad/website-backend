const { NotFound } = require("http-errors");
const { fetchTask } = require("../models/tasks");
const { fetchUser } = require("../models/users");
const fireStore = require("../utils/firestore");
const {
  RESPONSE_MESSAGES: { PROGRESS_DOCUMENT_NOT_FOUND },
  MILLISECONDS_IN_DAY,
} = require("../constants/progresses");
const progressesCollection = fireStore.collection("progresses");

/**
 * Returns the progress date timestamp
 *
 * @returns {Date} A date object representing the current time in IST Timezone
 */
const getProgressDateTimestamp = () => {
  // Currently, we are primarily catering to Indian users for our apps, which is why we have implemented support for the IST (Indian Standard Time) timezone for progress updates.
  const currentHourIST = new Date().getUTCHours() + 5.5; // IST offset is UTC+5:30;
  const isBefore6amIST = currentHourIST === 5.5 && new Date().getUTCMinutes() <= 30;
  return isBefore6amIST ? new Date().setUTCHours(0, 0, 0, 0) - MILLISECONDS_IN_DAY : new Date().setUTCHours(0, 0, 0, 0);
};

/**
 * Builds a Firestore query for posting progress documents based on the given parameters.
 *
 * @param {Object} params - An object containing the parameters for the query.
 * @param {string} params.type - The type of query to build, either "user" or "task".
 * @param {string} params.userId - The ID of the user to filter progress documents by, if `type` is "user".
 * @param {string} params.taskId - The ID of the task to filter progress documents by, if `type` is "task".
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 */
const buildQueryForPostingProgress = ({ type, userId, taskId }) => {
  const query =
    type === "user"
      ? progressesCollection.where("userId", "==", userId)
      : progressesCollection.where("taskId", "==", taskId);
  return query;
};

/**
 * Checks if a user with a given ID exists in the system.
 *
 * @async
 * @param {string} userId - The ID of the user to check for existence.
 * @throws {NotFound} If the user with the given ID does not exist.
 * @returns {Promise<void>} A promise that resolves if the user exists and rejects with a `NotFound` error if the user does not exist.
 */
const assertUserExists = async (userId) => {
  const { userExists } = await fetchUser({ userId });
  if (!userExists) {
    throw new NotFound(`User with id ${userId} does not exist.`);
  }
};

/**
 * Checks if a user with a given ID exists in the system.
 *
 * @async
 * @param {string} taskData - The ID of the task to check for existence.
 * @throws {NotFound} If the task with the given ID does not exist.
 * @returns {Promise<void>} A promise that resolves if the task exists and rejects with a `NotFound` error if the task does not exist.
 */
const assertTaskExists = async (taskId) => {
  const { taskData } = await fetchTask(taskId);
  if (!taskData) {
    throw new NotFound(`Task with id ${taskId} does not exist.`);
  }
};

/**
 * Checks if a user or task with the given ID exists in the system.
 *
 * @async
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} [queryParams.userId] - (Optional) The ID of the user to check for existence.
 * @param {string} [queryParams.taskId] - (Optional) The ID of the task to check for existence.
 * @throws {NotFound} If neither a user nor a task with the given ID exists in the system.
 * @returns {Promise<void>} A promise that resolves if either the user or the task exists and rejects with a `NotFound` error if neither exists.
 */
const assertUserOrTaskExists = async (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    await assertUserExists(userId);
  } else if (taskId) {
    await assertTaskExists(taskId);
  }
};

/**
 * Builds a Firestore query for retrieving progress documents within a date range and optionally filtered by user ID or task ID.
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} queryParams.userId - (Optional) The user ID to filter progress documents by.
 * @param {string} queryParams.taskId - (Optional) The task ID to filter progress documents by.
 * @param {string} queryParams.type - (Optional) The type to filter progress documents by.
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 */
const buildQueryToFetchDocs = (queryParams) => {
  const { type, userId, taskId } = queryParams;
  if (type) {
    return progressesCollection.where("type", "==", type);
  } else if (userId) {
    return progressesCollection.where("type", "==", "user").where("userId", "==", userId);
  } else {
    return progressesCollection.where("type", "==", "task").where("taskId", "==", taskId);
  }
};

/**
 * Retrieves progress documents from Firestore based on the given query.
 * @param {Query} query - A Firestore query object for fetching progress documents.
 * @returns {Array.<Object>} An array of objects representing the retrieved progress documents. Each object contains the document ID and its data.
 * @throws {NotFound} If no progress documents are found based on the given query.
 */
const getProgressDocs = async (query) => {
  const progressesDocs = await query.get();
  if (!progressesDocs.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push({ id: doc.id, ...doc.data() });
  });
  return docsData;
};
/**
 * Builds a Firestore query for retrieving progress documents within a date range and optionally filtered by user ID or task ID.
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} queryParams.userId - (Optional) The user ID to filter progress documents by.
 * @param {string} queryParams.taskId - (Optional) The task ID to filter progress documents by.
 * @param {string} queryParams.startDate - The start date of the date range (inclusive). Should be in ISO format (e.g. "2023-05-11").
 * @param {string} queryParams.endDate - The end date of the date range (inclusive). Should be in ISO format (e.g. "2023-05-11").
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 * @throws {Error} If neither userId nor taskId is provided in the queryParams object.
 */
const buildRangeProgressQuery = (queryParams) => {
  const { userId, taskId, startDate, endDate } = queryParams;
  let query = progressesCollection;
  if (userId) {
    query = query.where("userId", "==", userId);
  } else if (taskId) {
    query = query.where("taskId", "==", taskId);
  } else {
    throw new Error("Either userId or taskId is required.");
  }
  const startDateTimestamp = Date.parse(startDate);
  const endDateTimestamp = Date.parse(endDate);
  query = query.where("date", ">=", startDateTimestamp).where("date", "<=", endDateTimestamp);
  return query;
};
/**
 * Retrieves progress records for a given date range.
 * @param {QuerySnapshot} query - A reference to the query for fetching progress documents.
 * @param {Object} queryParams - An object containing the start and end date for the date range.
 * @param {string} queryParams.startDate - The start date of the date range (inclusive).
 * @param {string} queryParams.endDate - The end date of the date range (inclusive).
 * @returns {Object.<string, boolean>} An object where each key represents a date between the start and end date, and the value for each key represents whether a progress document exists for that date or not.
 */
const getProgressRecords = async (query, queryParams) => {
  const { startDate, endDate } = queryParams;
  const docsData = {};
  const queryResult = await query.get();
  if (!queryResult.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const progressesDocs = queryResult.docs;
  progressesDocs.forEach((doc) => {
    const date = new Date(doc.data().date).toISOString().slice(0, 10);
    docsData[date] = true;
  });

  const progressRecords = {};
  const currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    const date = currentDate.toISOString().slice(0, 10);
    progressRecords[date] = Boolean(docsData[date]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return progressRecords;
};

/**
 * Retrieves progress records for a given date range.
 * @param {Object} pathParamsObject - An object containing the type , typeId and date.
 * @param {string} pathParamsObject.type - The type of the record i.e user or task.
 * @param {string} pathParamsObject.typeId - The id of the type i.e user or task.
 * @param {string} pathParamsObject.date - The date of the record
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 *
 */
const buildQueryToSearchProgressByDay = (pathParams) => {
  const { userId, taskId, date } = pathParams;
  let query = progressesCollection;
  if (userId) {
    query = query.where("userId", "==", userId);
  } else {
    query = query.where("taskId", "==", taskId);
  }
  const dateTimeStamp = new Date(date).setUTCHours(0, 0, 0, 0);
  query = query.where("date", "==", dateTimeStamp).limit(1);
  return query;
};
module.exports = {
  getProgressDateTimestamp,
  buildQueryForPostingProgress,
  assertUserExists,
  assertTaskExists,
  assertUserOrTaskExists,
  buildQueryToFetchDocs,
  getProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
  buildQueryToSearchProgressByDay,
};
