const { TASK_REQUEST_STATUS } = require("../constants/taskRequests");
const { TASK_STATUS } = require("../constants/tasks");
const firestore = require("../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksModel = require("./tasks");
const userModel = require("./users");

/**
 * Fetch all task requests
 *
 * @return {Object}
 */
const fetchTaskRequests = async () => {
  const taskRequests = [];

  const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

  const taskPromises = [];
  const userPromises = [];

  taskRequestsSnapshots.forEach((taskRequestsSnapshot) => {
    const taskRequestData = taskRequestsSnapshot.data();
    const { requestors } = taskRequestData;

    taskPromises.push(tasksModel.fetchTask(taskRequestData.taskId));
    userPromises.push(Promise.all(requestors.map((requestor) => userModel.fetchUser({ userId: requestor }))));

    taskRequests.push(taskRequestData);
  });

  const tasks = await Promise.all(taskPromises);
  const users = await Promise.all(userPromises);

  taskRequests.forEach((taskRequest, index) => {
    taskRequest.task = tasks[index].taskData;
    taskRequest.requestors = users[index];
  });

  return taskRequests;
};

/**
 * Creates a task request
 *
 * @param taskId { string }: id of task request
 * @return {Promise<{taskRequest: Object}>}
 */
const addOrUpdate = async (taskId, userId) => {
  try {
    const taskRequestsSnapshot = await taskRequestsCollection.where("taskId", "==", taskId).get();
    const [taskRequestRef] = taskRequestsSnapshot.docs;
    const taskRequestData = taskRequestRef?.data();

    if (taskRequestData) {
      const currentRequestors = taskRequestData.requestors;
      const alreadyRequesting = currentRequestors.some((requestor) => requestor === userId);
      if (alreadyRequesting) {
        return { alreadyRequesting };
      }

      const updatedRequestors = [...currentRequestors, userId];
      await taskRequestsCollection.doc(taskRequestRef.id).update({ requestors: updatedRequestors });

      return {
        isCreate: false,
        requestors: updatedRequestors,
      };
    }

    const newTaskRequest = {
      requestors: [userId],
      status: TASK_REQUEST_STATUS.WAITING,
      taskId,
    };

    await taskRequestsCollection.add(newTaskRequest);

    return {
      isCreate: true,
      taskRequest: newTaskRequest,
    };
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

/**
 * Approves task request to user
 *
 * @param taskRequestId { string }: id of task request
 * @param userId { Object }: user whose being approved
 * @return {Promise<{approvedTo: string, taskRequest: Object}>}
 */
const approveTaskRequest = async (taskRequestId, user) => {
  try {
    const taskRequest = await taskRequestsCollection.doc(taskRequestId).get();

    const updatedTaskRequest = {
      ...taskRequest.data(),
      approvedTo: user.id,
      status: TASK_REQUEST_STATUS.APPROVED,
    };

    await taskRequestsCollection.doc(taskRequestId).set(updatedTaskRequest);
    await tasksModel.updateTask({ assignee: user.id, status: TASK_STATUS.ASSIGNED }, taskRequestId);

    return {
      approvedTo: user.username,
      taskRequest: updatedTaskRequest,
    };
  } catch (err) {
    logger.error("Error in approving task", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
  addOrUpdate,
  approveTaskRequest,
};
