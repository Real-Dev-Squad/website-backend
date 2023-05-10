const { Conflict } = require("http-errors");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");
const { fetchTask } = require("./tasks");
const { fetchUser } = require("./users");
const { MILLISECONDS_IN_DAY, RESPONSE_MESSAGES } = require("../constants/progresses");
const { PROGRESS_ALREADY_CREATED } = RESPONSE_MESSAGES;

/**
 * Adds a new progress document for the given user or task, with a limit of one progress document per day.
 * @param progressData {object} The data to be added. It should be an object containing key-value pairs of the fields to be added, including a "type" field set to either "user" or "task".
 * @returns {Promise<object>} A Promise that resolves with the added progress document object, or rejects with an error object if the add operation fails.
 * @throws {Error} If a progress document has already been created for the given user or task on the current day.
 **/
const createProgressDocument = async (progressData) => {
  const { type, userId, taskId } = progressData;
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
  const { type, userId, taskId } = queryParams;
  if (userId) {
    const { userExists } = await fetchUser({ userId });
    if (!userExists) {
      throw new Error(`User with id ${userId} does not exist`);
    }
  } else if (taskId) {
    const { taskData } = await fetchTask(taskId);
    if (!taskData) {
      throw new Error(`Task with id ${taskId} does not exist`);
    }
  }
  let query;
  if (type) {
    query = progressesCollection.where("type", "==", type);
  } else {
    if (userId) {
      query = progressesCollection.where("type", "==", "user").where("userId", "==", userId);
    } else if (taskId) {
      query = progressesCollection.where("type", "==", "task").where("taskId", "==", taskId);
    }
  }
  const progressesDocs = await query.get();
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push(doc.data());
  });
  return docsData;
};

/**
 * This function fetches the progress records for a particular user or task within the specified date range, from start to end date.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - userId, taskId, startDate, and endDate.
 * @returns {Promise<object>} A Promise that resolves with the progress records of the queried user or task.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getRangeProgressData = async (queryParams) => {
  const { userId, taskId, startDate, endDate } = queryParams;
  if (!userId && !taskId) {
    throw new Error("Either userId or taskId is required.");
  }
  const startDateTimestamp = Date.parse(startDate);
  const endDateTimestamp = Date.parse(endDate);

  if (userId) {
    const { userExists } = await fetchUser({ userId });
    if (!userExists) {
      throw new Error(`User with id ${userId} does not exist`);
    }
  } else {
    const { taskData } = await fetchTask(taskId);
    if (!taskData) {
      throw new Error(`Task with id ${taskId} does not exist`);
    }
  }

  let query = progressesCollection;
  if (userId) {
    query = query.where("userId", "==", userId);
  } else {
    query = query.where("taskId", "==", taskId);
  }
  query = query.where("date", ">=", startDateTimestamp).where("date", "<=", endDateTimestamp);

  const progressesDocs = (await query.get()).docs;
  const docsData = {};
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

  return {
    startDate,
    endDate,
    progressRecords,
  };
};

module.exports = { createProgressDocument, getProgressDocument, getRangeProgressData };
