const firestore = require("../utils/firestore");
const userModel = firestore.collection("user");
const taskRequestsModel = firestore.collection("taskRequests");

const fetchTaskRequests = async () => {
  try {
    const taskRequests = await taskRequestsModel.get();

    return taskRequests.data();
  } catch (err) {
    logger.error("error fetching tasks", err);
    throw err;
  }
};

const fetchTaskRequestsByUserId = async (userId) => {
  try {
    const taskRequests = await taskRequestsModel.doc(userId).get();

    return taskRequests.data();
  } catch (err) {
    logger.error("Error retrieving task data", err);
    throw err;
  }
};

const createTaskRequest = async (requestInfo) => {
  try {
    const { taskId, userId } = requestInfo;

    const taskRequest = await taskRequestsModel.doc(taskId).get();
    const user = await userModel.doc(userId).get();

    if (taskRequest) {
      const requestedBy = await taskRequest.data().requestedBy;
      const isUserExisting = requestedBy.find((user) => user.id === userId);

      if (isUserExisting) {
        return taskRequest;
      }

      await taskRequest.update({ requestedBy: [...requestedBy, user] });
      return taskRequest.data();
    }

    const taskRequestData = {
      taskId,
    };
    const taskRequestInfo = await taskRequestsModel.add(taskRequestData);

    return taskRequestInfo;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

const approveTask = async (taskRequestId, userId) => {
  try {
    const taskRequest = await taskRequestsModel.doc({ id: taskRequestId }).get();
    const user = await userModel.doc({ id: userId }).get();

    if (user) {
      taskRequest.update({ approvedTo: userId });
      // TODO: Update tasks
      // TODO: update user status
    }

    return { user };
  } catch (err) {
    logger.error("Error in approving task", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
  fetchTaskRequestsByUserId,
  createTaskRequest,
  approveTask,
};
