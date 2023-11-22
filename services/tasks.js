const firestore = require("../utils/firestore");
const tasksModel = firestore.collection("tasks");
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
module.exports = {
  updateTaskStatusToDone,
};
