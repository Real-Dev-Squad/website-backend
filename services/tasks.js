const firestore = require("../utils/firestore");
const tasksModel = firestore.collection("tasks");
const { chunks } = require("../utils/array");
const { DOCUMENT_WRITE_SIZE: FIRESTORE_BATCH_OPERATIONS_LIMIT } = require("../constants/constants");
const usersQuery = require("../models/users");
const tasksQuery = require("../models/tasks");

const addTaskCreatedAtAndUpdatedAtFields = async () => {
  const operationStats = {
    totalTasks: 0,
    totalTaskToBeUpdate: 0,
    totalTasksUpdated: 0,
    totalFailedTasks: 0,
    failedTasksIds: [],
  };
  const updatedTasks = [];
  const tasks = await tasksModel.get();

  if (tasks.empty) {
    return operationStats;
  }

  operationStats.totalTasks = tasks.size;

  tasks.forEach((task) => {
    const taskData = task.data();
    let didAddField = false;
    if (!taskData.createdAt) {
      taskData.createdAt = task.createTime.seconds;
      didAddField = true;
    }
    if (!taskData.updatedAt) {
      taskData.updatedAt = task.updateTime.seconds;
      didAddField = true;
    }
    if (didAddField) {
      updatedTasks.push({ id: task.id, data: taskData });
    }
  });

  operationStats.totalTaskToBeUpdate = updatedTasks.length;

  const chunkedTasks = chunks(updatedTasks, FIRESTORE_BATCH_OPERATIONS_LIMIT);

  chunkedTasks.forEach((tasks) => {
    const batch = firestore.batch();
    tasks.forEach(({ id, data }) => {
      batch.update(tasksModel.doc(id), data);
    });
    try {
      batch.commit();
      operationStats.totalTasksUpdated += tasks.length;
    } catch (error) {
      operationStats.totalFailedTasks += tasks.length;
      tasks.forEach(({ id }) => operationStats.failedTasksIds.push(id));
    }
  });
  return operationStats;
};

const fetchOrphanedTasks = async () => {
  try {
    const userSnapshot = await usersQuery.fetchUsersNotInDiscordServer();

    if (userSnapshot.empty) return [];

    const userIds = userSnapshot.docs.map((doc) => doc.id);

    const orphanedTasksData = await tasksQuery.fetchIncompleteTasksByUserIds(userIds);

    if (orphanedTasksData.empty) {
      return [];
    }

    const orphanedTasks = orphanedTasksData;

    return orphanedTasks;
  } catch (error) {
    logger.error(`Error in getting tasks abandoned by users:  ${error}`);
    throw error;
  }
};

module.exports = {
  addTaskCreatedAtAndUpdatedAtFields,
  fetchOrphanedTasks,
};
