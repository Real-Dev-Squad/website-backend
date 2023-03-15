const { TASK_REQUEST_STATUS } = require("../constants/taskRequests");
const { TASK_STATUS } = require("../constants/tasks");
const { USER_STATUS } = require("../constants/users");
const firestore = require("../utils/firestore");
const { toFirestoreData } = require("../utils/taskRequests");
const usersCollection = firestore.collection("users");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksCollection = firestore.collection("tasks");
const tasksModel = require("./tasks");

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
 * @param userId { string }: userId of user whose creating the task request
 * @return {Promise<{taskRequest: Object}>}
 */
const createTaskRequest = async (taskId, userId) => {
  try {
    const taskRequest = await taskRequestsCollection.doc(taskId).get();
    const user = await usersCollection.doc(userId).get();
    const task = (await tasksCollection.doc(taskId).get()).data();

    if (taskRequest.data()) {
      const requestedBy = await taskRequest.data().requestedBy;
      const isUserAlreadyRequesting = requestedBy.find((id) => id === userId);

      if (isUserAlreadyRequesting) {
        return { message: "User already exists" };
      }

      const updatedRequestedBy = [...requestedBy, user.id];
      await taskRequestsCollection.doc(taskId).update({ requestedBy: updatedRequestedBy });
      return {
        message: "Task request updated successfully",
        taskRequest: taskRequest.data(),
      };
    }

    const newTaskRequest = {
      requestedBy: [userId],
      title: task.title,
      purpose: task.purpose,
      priority: task.priority,
      isNoteworthy: task.isNoteworthy,
      type: task.type,
      status: TASK_REQUEST_STATUS.WAITING,
    };
    const taskRequestDocument = toFirestoreData(newTaskRequest);

    await taskRequestsCollection.doc(taskId).set(taskRequestDocument);

    return {
      message: "Task request created successfully",
      taskRequest: { ...taskRequestDocument },
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
 * @param userId { string }: id of user whose being approved
 * @return {Promise<{taskId: string}>}
 */
const approveTaskRequest = async (taskRequestId, userId) => {
  try {
    const taskRequest = await taskRequestsCollection.doc(taskRequestId).get();
    const user = (await usersCollection.doc(userId).get()).data();

    if (!user) {
      return {
        error: "User does not exists",
      };
    }

    if (user.status === USER_STATUS.OOO || user.status === USER_STATUS.ACTIVE) {
      return {
        error: "User is unavailable",
      };
    }

    await taskRequestsCollection.doc(taskRequestId).set({
      ...taskRequest.data(),
      approvedTo: user.username,
      status: TASK_REQUEST_STATUS.APPROVED,
    });
    await tasksModel.updateTask({ assignee: user.username, status: TASK_STATUS.ASSIGNED }, taskRequestId);

    return {
      message: `Task assigned to user ${user.username}`,
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
};
