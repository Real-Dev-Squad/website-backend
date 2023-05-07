const firestore = require("../utils/firestore");
const progressesCollection = firestore.collection("progresses");
const { fetchTask } = require("./tasks");

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
    ? new Date().setUTCHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000
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
    throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} Progress for the day has already been created`);
  }

  const progressDocument = { ...progressData, createdAt: createdAtTimestamp, date: progressDateTimestamp };
  const { id } = await progressesCollection.add(progressDocument);
  return { ...progressDocument, id };
};

/**
 * This function retrieves the progress document for a specific user or task, or for all users or all tasks if no specific user or task is provided.
 * @param progressData {object} The data to be added. It should be an object containing key-value pairs of the fields to be added, including a "type" field set to either "user" or "task".
 * @returns {Promise<object>} A Promise that resolves with the progress document objects.
 **/
const getProgressDocument = async (reqBody) => {
  const { type, userId, taskId } = reqBody;
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

module.exports = { createProgressDocument, getProgressDocument };
