const { TASK_REQUEST_STATUS, TASK_REQUEST_TYPE } = require("../constants/taskRequests");
const { TASK_TYPE } = require("../constants/tasks");
const firestore = require("../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksModel = require("./tasks");
const userModel = require("./users");
const tasksCollection = firestore.collection("tasks");

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
    return await firestore.runTransaction(async (transaction) => {
      const taskRequestDocRef = taskRequestsCollection.doc(taskRequestId);
      const taskRequestDoc = await transaction.get(taskRequestDocRef);
      const taskRequestData = taskRequestDoc.data();
      if (!taskRequestData) {
        return { taskRequestNotFound: true };
      }
      let isUserInvalid;
      if (taskRequestData.users) {
        isUserInvalid = !taskRequestData.users.some((userElement) => user.id === userElement.userId);
      } else {
        isUserInvalid = !taskRequestData.requestors.some((userId) => user.id === userId);
      }
      if (isUserInvalid) {
        return { isUserInvalid };
      }
      if (
        taskRequestData.status === TASK_REQUEST_STATUS.APPROVED ||
        taskRequestData.status === TASK_REQUEST_STATUS.DENIED
      ) {
        return { isTaskRequestInvalid: true };
      }
      if (taskRequestData.requestType === TASK_REQUEST_TYPE.CREATION) {
        // TODO : extract the common code after the migration of the task request model. https://github.com/Real-Dev-Squad/website-backend/issues/1613
        let userRequestData;
        taskRequestData.users.forEach((userElement) => {
          if (userElement.userId === user.id) {
            userElement.status = TASK_REQUEST_STATUS.APPROVED;
            userRequestData = userElement;
          }
        });
        const updatedTaskRequest = {
          users: taskRequestData.users,
          approvedTo: user.id,
          status: TASK_REQUEST_STATUS.APPROVED,
        };
        // End of TODO
        const updateTaskRequestPromise = transaction.update(taskRequestDocRef, updatedTaskRequest);
        const newTaskRequestData = {
          assignee: user.id,
          title: taskRequestData.taskTitle,
          type: TASK_TYPE.FEATURE,
          startedOn: userRequestData.proposedStartDate / 1000,
          endsOn: userRequestData.proposedDeadline / 1000,
          github: {
            issue: {
              url: taskRequestData.externalIssueUrl,
            },
          },
        };
        const newTaskDocRef = tasksCollection.doc();
        const addTaskPromise = transaction.set(newTaskDocRef, newTaskRequestData);
        await Promise.all([updateTaskRequestPromise, addTaskPromise]);
        return {
          approvedTo: user.username,
          taskRequest: {
            ...updatedTaskRequest,
            taskId: newTaskDocRef.id,
          },
        };
      } else {
        // TODO : extract the common code and remove the unnecessary if-condition after the migration of the task request model. https://github.com/Real-Dev-Squad/website-backend/issues/1613
        const updatedTaskRequest = {
          approvedTo: user.id,
          status: TASK_REQUEST_STATUS.APPROVED,
        };
        let userRequestData;
        if (taskRequestData.users) {
          taskRequestData.users.forEach((userElement) => {
            if (userElement.userId === user.id) {
              userElement.status = TASK_REQUEST_STATUS.APPROVED;
              userRequestData = userElement;
            }
          });
          updatedTaskRequest.users = taskRequestData.users;
        }
        // End of TODO
        const updateTaskRequestPromise = transaction.update(taskRequestDocRef, updatedTaskRequest);
        const updatedTaskData = { assignee: user.id };
        // TODO : remove the unnecessary if-condition after the migration of the task request model. https://github.com/Real-Dev-Squad/website-backend/issues/1613
        if (userRequestData) {
          updatedTaskData.startedOn = userRequestData.proposedStartDate / 1000;
          updatedTaskData.endsOn = userRequestData.proposedDeadline / 1000;
        }
        // End of TODO
        const oldTaskDocRef = tasksCollection.doc(taskRequestData.taskId);
        const updateTaskPromise = transaction.update(oldTaskDocRef, updatedTaskData);
        await Promise.all([updateTaskRequestPromise, updateTaskPromise]);
        return {
          approvedTo: user.username,
          taskRequest: {
            ...updatedTaskRequest,
            taskId: oldTaskDocRef.id,
          },
        };
      }
    });
  } catch (err) {
    logger.error("Error in approving task", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
  fetchTaskRequestById,
  addOrUpdate,
  approveTaskRequest,
};
