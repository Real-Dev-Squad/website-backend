const { fetchTask } = require("../models/tasks");
const { fetchUser } = require("../models/users");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");

const assertUserExist = async (userId) => {
  const { userExists } = await fetchUser({ userId });
  if (!userExists) {
    throw new Error(`User with id ${userId} does not exist`);
  }
};

const assertTaskExist = async (taskId) => {
  const { taskData } = await fetchTask(taskId);
  if (!taskData) {
    throw new Error(`Task with id ${taskId} does not exist`);
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

module.exports = { assertUserExist, assertTaskExist, buildQuery, getProgressDocs };
