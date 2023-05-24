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

  const visitedUsersId = new Set();
  const visitedUsers = [];

  const taskRequestsSnapshot = (await taskRequestsCollection.get()).docs;

  for (const taskRequestSnapshot of taskRequestsSnapshot) {
    const taskRequest = taskRequestSnapshot.data();
    const { taskData } = await tasksModel.fetchTask(taskRequest.taskId);
    const users = await Promise.all(
      taskRequest.requestors.map((requestor) => {
        if (visitedUsersId.has(requestor)) {
          return visitedUsers.find((visitedUserId) => (visitedUserId.id = requestor));
        }
        return userModel.fetchUser({ userId: requestor });
      })
    );

    taskRequests.push({ id: taskRequestSnapshot.id, ...taskRequest, task: taskData, requestors: users });
  }

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
        isUpdate: true,
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
    await tasksModel.updateTask({ assignee: user.username, status: TASK_STATUS.ASSIGNED }, taskRequestId);

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
