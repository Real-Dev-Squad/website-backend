const { TASK_REQUEST_STATUS } = require("../constants/taskRequests");
const { TASK_STATUS } = require("../constants/tasks");
const { userState } = require("../constants/userStatus");
const firestore = require("../utils/firestore");
const { toFirestoreData } = require("../utils/taskRequests");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksModel = require("./tasks");
const userModel = require("./users");
const userStatusModel = require("./userStatus");

/**
 * Fetch all task requests
 *
 * @return {Object}
 */
const fetchTaskRequests = async () => {
  try {
    const taskRequests = await taskRequestsCollection.get();

    const taskRequestsData = [];

    taskRequests.forEach((taskRequest) => taskRequestsData.push({ id: taskRequest.id, ...taskRequest.data() }));

    return taskRequestsData;
  } catch (err) {
    logger.error("error fetching tasks", err);
    throw err;
  }
};

/**
 * Creates a task request
 *
 * @param taskId { string }: id of task request
 * @return {Promise<{taskRequest: Object}>}
 */
const createTaskRequest = async (taskId) => {
  try {
    const taskRequest = await taskRequestsCollection.doc(taskId).get();
    const { taskData } = await tasksModel.fetchTask(taskId);

    if (!taskData) {
      return { taskDoesNotExist: true };
    }

    if (taskRequest.data()) {
      return {
        taskRequestExists: true,
      };
    }

    const newTaskRequest = {
      isNoteworthy: taskData.isNoteworthy,
      priority: taskData.priority,
      purpose: taskData.purpose,
      status: TASK_REQUEST_STATUS.WAITING,
      title: taskData.title,
      type: taskData.type,
    };
    const taskRequestDocument = toFirestoreData(newTaskRequest);

    await taskRequestsCollection.doc(taskId).set(taskRequestDocument);

    return taskRequestDocument;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

/** Updates task request
 * @param taskId {string}: task id of task the user want to create request
 * @param userId {string}: user id of user requesting the task
 * @returns taskRequestObject {Object}: updated task request object
 */
const addRequestor = async (taskId, userId) => {
  try {
    const { userExists, user } = await userModel.fetchUser({ userId });

    if (!userExists) {
      return { userDoesNotexists: true };
    }

    const taskRequest = (await taskRequestsCollection.doc(taskId).get()).data();

    if (!taskRequest) {
      return { taskRequestMissing: true };
    }

    const requestedBy = taskRequest.requestedBy || [];
    const userRequestExists = requestedBy.find((id) => id === userId);

    if (userRequestExists) {
      return { userRequestExists };
    }

    const updatedRequestedBy = [...requestedBy, user.id];
    return await taskRequestsCollection.doc(taskId).update({ requestedBy: updatedRequestedBy });
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};

/**
 * Approves task request to user
 *
 * @param taskRequestId { string }: id of task request
 * @param userId { string }: id of user whose being approved
 * @return {Promise<{approvedTo: string, taskRequest: Object}>}
 */
const approveTaskRequest = async (taskRequestId, userId) => {
  try {
    const taskRequest = await taskRequestsCollection.doc(taskRequestId).get();
    const { user, userExists } = await userModel.fetchUser({ userId });
    const { data: userStatus, userExists: userStatusExists } = await userStatusModel.getUserStatus(userId);

    if (!userExists) {
      return { userDoesNotExists: true };
    }
    if (userStatusExists) {
      return { userStatusDoesNotExists: true };
    }

    if (userStatus.currentStatus.state === userState.OOO) {
      return { isUserOOO: true };
    }
    if (userStatus.currentStatus.state === userState.ACTIVE) {
      return { isUserActive: true };
    }

    const updatedTaskRequest = {
      ...taskRequest.data(),
      approvedTo: user.username,
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
  createTaskRequest,
  approveTaskRequest,
  addRequestor,
};
