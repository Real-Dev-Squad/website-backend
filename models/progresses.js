const { Conflict } = require("http-errors");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");
const { fetchTask } = require("./tasks");
const { MILLISECONDS_IN_DAY, RESPONSE_MESSAGES } = require("../constants/progresses");
const {
  buildQuery,
  getProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
  assertUserOrTaskExists,
} = require("../utils/progresses");
const { PROGRESS_ALREADY_CREATED } = RESPONSE_MESSAGES;

/**
 * Adds a new progress document for the given user or task, with a limit of one progress document per day.
 * @param progressData {object} The data to be added. It should be an object containing key-value pairs of the fields to be added, including a "type" field set to either "user" or "task".
 * @returns {Promise<object>} A Promise that resolves with the added progress document object, or rejects with an error object if the add operation fails.
 * @throws {Error} If a progress document has already been created for the given user or task on the current day.
 **/
const createProgressDocument = async (progressData) => {
  const { type, userId, taskId } = progressData;
  // Currently, we are primarily catering to Indian users for our apps, which is why we have implemented support for the IST (Indian Standard Time) timezone for progress updates.
  const createdAtTimestamp = new Date().getTime();
  const currentHourIST = new Date().getUTCHours() + 5.5; // IST offset is UTC+5:30
  const isBefore6amIST = currentHourIST < 6;
  const progressDateTimestamp = isBefore6amIST
    ? new Date().setUTCHours(0, 0, 0, 0) - MILLISECONDS_IN_DAY
    : new Date().setUTCHours(0, 0, 0, 0);

  if (type === "task") {
    const { taskData } = await fetchTask(taskId);
    if (!taskData) {
      throw new Error(`Task with id ${taskId} does not exist`);
    }
  }

  const query =
    type === "user"
      ? progressesCollection.where("userId", "==", userId)
      : progressesCollection.where("taskId", "==", taskId);

  const existingDocumentSnapshot = await query.where("date", "==", progressDateTimestamp).get();

  if (!existingDocumentSnapshot.empty) {
    throw new Conflict(`${type.charAt(0).toUpperCase() + type.slice(1)} ${PROGRESS_ALREADY_CREATED}`);
  }

  const progressDocument = { ...progressData, createdAt: createdAtTimestamp, date: progressDateTimestamp };
  const { id } = await progressesCollection.add(progressDocument);
  return { ...progressDocument, id };
};

/**
 * This function retrieves the progress document for a specific user or task, or for all users or all tasks if no specific user or task is provided.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - type, userId, taskId.
 * @returns {Promise<object>} A Promise that resolves with the progress document objects.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getProgressDocument = async (queryParams) => {
  await assertUserOrTaskExists(queryParams);
  const query = buildQuery(queryParams);
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

module.exports = { createProgressDocument, getProgressDocument, getRangeProgressData };
