const firestore = require("../utils/firestore");
const tasksModel = firestore.collection("tasks");
const { chunks } = require("../utils/array");
const { DOCUMENT_WRITE_SIZE: FIRESTORE_BATCH_OPERATIONS_LIMIT } = require("../constants/constants");

const updateTaskStatusToDone = async (tasksData) => {
  const batch = firestore.batch();
  const tasksBatch = [];
  const summary = {
    totalUpdatedStatus: 0,
    totalOperationsFailed: 0,
    updatedTaskDetails: [],
    failedTaskDetails: [],
  };
  tasksData.forEach((task) => {
    const updateTaskData = { ...task, status: "DONE" };
    batch.update(tasksModel.doc(task.id), updateTaskData);
    tasksBatch.push(task.id);
  });
  try {
    await batch.commit();
    summary.totalUpdatedStatus += tasksData.length;
    summary.updatedTaskDetails = [...tasksBatch];
    return { ...summary };
  } catch (err) {
    logger.error("Firebase batch Operation Failed!");
    summary.totalOperationsFailed += tasksData.length;
    summary.failedTaskDetails = [...tasksBatch];
    return { ...summary };
  }
};

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

module.exports = {
  updateTaskStatusToDone,
  addTaskCreatedAtAndUpdatedAtFields,
};
