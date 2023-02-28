const firestore = require("../utils/firestore");
// const userStatusModel = firestore.collection("userStatus");
const taskRequestsModel = firestore.collection("taskRequests");

const fetchTaskRequests = async () => {
  try {
    const taskRequestsSnapshot = await taskRequestsModel().get();
    const tasksRequests = [];

    taskRequestsSnapshot.forEach((taskRequest) => {
      tasksRequests.push(taskRequest);
    });
    return tasksRequests;
  } catch (err) {
    logger.error("error fetching tasks", err);
    throw err;
  }
};

const createTaskRequest = async (requestInfo) => {
  try {
    const { taskId, userId } = requestInfo;
    const taskRequest = taskRequestsModel.doc(taskId).get();

    if (taskRequest) {
      throw new Error("Task request with same task id already exists");
    }

    const taskRequestData = {
      // contains data according to task request schema
      userId,
      taskId,
    };
    const taskRequestInfo = await taskRequestsModel.add(taskRequestData);

    return taskRequestInfo;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
  createTaskRequest,
};
