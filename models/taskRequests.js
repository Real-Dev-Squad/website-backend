const { TASK_REQUEST_STATUS, TASK_REQUEST_TYPE } = require("../constants/taskRequests");
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

  try {
    const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

    const taskPromises = [];
    const userPromises = [];

    taskRequestsSnapshots.forEach((taskRequestsSnapshot) => {
      const taskRequestData = taskRequestsSnapshot.data();
      taskRequestData.id = taskRequestsSnapshot.id;
      taskRequestData.url = new URL(`/taskRequests/${taskRequestData.id}`, config.get("services.rdsUi.baseUrl"));
      const { requestors } = taskRequestData;

      taskPromises.push(tasksModel.fetchTask(taskRequestData.taskId));
      userPromises.push(Promise.all(requestors.map((requestor) => userModel.fetchUser({ userId: requestor }))));

      taskRequests.push(taskRequestData);
    });

    const tasks = await Promise.all(taskPromises);
    const users = await Promise.all(userPromises);

    taskRequests.forEach((taskRequest, index) => {
      taskRequest.task = tasks[+index].taskData;
      taskRequest.requestors = users[+index];
    });
  } catch (err) {
    logger.error("Error in updating task", err);
  }

  return taskRequests;
};

/**
 * Fetches task request by id
 *
 * @param taskRequestId { string }: id of task request
 * @return Promise<{taskRequest: Object}>
 */
const fetchTaskRequestById = async (taskRequestId) => {
  try {
    const taskRequestSnapshot = await taskRequestsCollection.doc(taskRequestId).get();
    const taskRequestData = taskRequestSnapshot.data();

    if (taskRequestData) {
      taskRequestData.id = taskRequestSnapshot.id;
      taskRequestData.url = new URL(`/taskRequests/${taskRequestData.id}`, config.get("services.rdsUi.baseUrl"));
    }
    return {
      taskRequestData,
      taskRequestExists: true,
    };
  } catch (err) {
    logger.error("Error in updating task", err);
  }

  return {
    taskRequestExists: false,
  };
};

const createRequest = async (data, authenticatedUsername) => {
  const queryFieldPath = data.requestType === TASK_REQUEST_TYPE.CREATION ? "externalIssueUrl" : "taskId";
  const queryValue = data.requestType === TASK_REQUEST_TYPE.CREATION ? data.externalIssueUrl : data.taskId;
  const taskRequestsSnapshot = await taskRequestsCollection.where(queryFieldPath, "==", queryValue).get();
  const [taskRequestRef] = taskRequestsSnapshot.docs;
  const taskRequestData = taskRequestRef?.data();
  const userRequest = {
    userId: data.userId,
    proposedDeadline: data.proposedDeadline,
    proposedStartDate: data.proposedStartDate,
    description: data.description,
    status: TASK_REQUEST_STATUS.PENDING,
  };
  if (!userRequest.description) delete userRequest.description;
  if (taskRequestData) {
    // TODO : remove after the migration of old data https://github.com/Real-Dev-Squad/website-backend/issues/1613
    const currentRequestors = taskRequestData.requestors;
    let alreadyRequesting = currentRequestors.some((requestor) => requestor === data.userId);
    // End of old logic
    const currentRequestingUsers = taskRequestData.users;
    alreadyRequesting = currentRequestingUsers.some((requestor) => requestor.userId === data.userId);
    if (alreadyRequesting) {
      return { alreadyRequesting };
    }
    // TODO : remove after the migration of old data https://github.com/Real-Dev-Squad/website-backend/issues/1613
    const updatedRequestors = [...currentRequestors, data.userId];
    // End of old logic
    const updatedUsers = [...currentRequestingUsers, userRequest];
    const updatedTaskRequest = {
      requestors: updatedRequestors,
      users: updatedUsers,
      lastModifiedBy: authenticatedUsername,
      lastModifiedAt: Date.now(),
    };
    await taskRequestsCollection.doc(taskRequestRef.id).update(updatedTaskRequest);
    return {
      id: taskRequestRef.id,
      isCreate: false,
      taskRequest: {
        ...taskRequestData,
        ...updatedTaskRequest,
      },
    };
  }
  const newTaskRequest = {
    requestors: [data.userId],
    status: TASK_REQUEST_STATUS.PENDING,
    taskTitle: data.taskTitle,
    taskId: data.taskId,
    externalIssueUrl: data.externalIssueUrl,
    requestType: data.requestType,
    users: [userRequest],
    createdBy: authenticatedUsername,
    createdAt: Date.now(),
    lastModifiedBy: authenticatedUsername,
    lastModifiedAt: Date.now(),
  };
  if (!newTaskRequest.externalIssueUrl) delete newTaskRequest.externalIssueUrl;
  if (!newTaskRequest.taskId) delete newTaskRequest.taskId;
  if (!newTaskRequest.taskTitle) delete newTaskRequest.taskTitle;
  const newTaskRequestRef = await taskRequestsCollection.add(newTaskRequest);
  return {
    isCreate: true,
    taskRequest: newTaskRequest,
    id: newTaskRequestRef.id,
  };
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

    const newTaskRequestRef = await taskRequestsCollection.add(newTaskRequest);

    return {
      isCreate: true,
      taskRequest: newTaskRequest,
      id: newTaskRequestRef.id,
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
  createRequest,
  fetchTaskRequests,
  fetchTaskRequestById,
  addOrUpdate,
  approveTaskRequest,
};
