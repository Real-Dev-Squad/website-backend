import firestore from "../utils/firestore.js";
import { chunks } from "../utils/array.js";
import { DOCUMENT_WRITE_SIZE as FIRESTORE_BATCH_OPERATIONS_LIMIT } from "../constants/constants.js";
import { fetchUsersNotInDiscordServer } from "../models/users.js";
import { fetchIncompleteTasksByUserIds } from "../models/tasks.js";
import logger from "../utils/logger.js";

const tasksModel = firestore.collection("tasks");

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
    const userSnapshot = await fetchUsersNotInDiscordServer();

    if (userSnapshot.empty) return [];

    const userIds = userSnapshot.docs.map((doc) => doc.id);

    const orphanedTasksData = await fetchIncompleteTasksByUserIds(userIds);

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

export { addTaskCreatedAtAndUpdatedAtFields, fetchOrphanedTasks };
