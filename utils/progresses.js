const { fetchTask } = require("../models/tasks");
const { fetchUser } = require("../models/users");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");

const assertUserExists = async (userId) => {
  const { userExists } = await fetchUser({ userId });
  if (!userExists) {
    throw new Error(`User with id ${userId} does not exist`);
  }
};

const assertTaskExists = async (taskId) => {
  const { taskData } = await fetchTask(taskId);
  if (!taskData) {
    throw new Error(`Task with id ${taskId} does not exist`);
  }
};

const assertUserOrTaskExists = async (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    await assertUserExists(userId);
  } else if (taskId) {
    await assertTaskExists(taskId);
  }
};
const buildQuery = (queryParams) => {
  const { type, userId, taskId } = queryParams;
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
  return query;
};

const getProgressDocs = async (query) => {
  const progressesDocs = await query.get();
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push(doc.data());
  });
  return docsData;
};

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

const getProgressRecords = async (query, queryParams) => {
  const { startDate, endDate } = queryParams;
  const docsData = {};
  const progressesDocs = (await query.get()).docs;
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

module.exports = {
  assertUserExists,
  assertTaskExists,
  assertUserOrTaskExists,
  buildQuery,
  getProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
};
