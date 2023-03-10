const firestore = require("../utils/firestore");
const { toFirestoreData } = require("../utils/taskRequests");
const usersCollection = firestore.collection("users");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksCollection = firestore.collection("tasks");

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

      await taskRequest.doc(taskId).set({ requestedBy: [...requestedBy, user] });
      return {
        message: "Task request updated successfully",
        taskRequest: taskRequest.data(),
      };
    }

    const payload = {
      requestedBy: [userId],
      title: task.title,
      purpose: task.purpose,
      priority: task.priority,
      isNoteworthy: task.isNoteworthy,
      type: task.type,
    };
    const taskRequestDocument = toFirestoreData(payload);

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
    const taskRequest = await taskRequestsCollection.doc({ id: taskRequestId }).get();
    const user = await usersCollection.doc({ id: userId }).get();

    if (user) {
      await taskRequest.update({ approvedTo: userId });
      // TODO: Update tasks
      // TODO: update user status
    }

    return { taskRequest, user };
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
