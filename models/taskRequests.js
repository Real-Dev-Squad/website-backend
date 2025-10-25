const {
  TASK_REQUEST_STATUS,
  TASK_REQUEST_TYPE,
  TASK_REQUEST_FILTER_KEYS,
  TASK_REQUEST_FILTER_VALUES,
  TASK_REQUEST_SORT_KEYS,
  TASK_REQUEST_SORT_VALUES,
  TASK_REQUEST_ERROR_MESSAGE,
} = require("../constants/taskRequests");
const { TASK_TYPE, TASK_STATUS, DEFAULT_TASK_PRIORITY } = require("../constants/tasks");
const { Operators } = require("../typeDefinitions/rqlParser");
const { RQLQueryParser } = require("../utils/RQLParser");
const firestore = require("../utils/firestore");
const { buildTaskRequests, generateLink, transformTaskRequests } = require("../utils/task-requests");
const { getCurrentEpochTime } = require("../utils/time");
const { convertMillisToSeconds } = require("../utils/time");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksModel = require("./tasks");
const userModel = require("./users");
const tasksCollection = firestore.collection("tasks");

/**
 * Fetch all task requests
 *
 * @return {Object}
 */
const fetchTaskRequests = async (dev) => {
  const taskRequests = [];
  const newTaskRequestsModel = [];
  try {
    const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

    const taskPromises = [];
    const userPromises = [];

    const newUserPromises = [];

    taskRequestsSnapshots.forEach((taskRequestsSnapshot) => {
      const taskRequestData = taskRequestsSnapshot.data();
      taskRequestData.id = taskRequestsSnapshot.id;
      taskRequestData.url = new URL(`/taskRequests/${taskRequestData.id}`, config.get("services.rdsUi.baseUrl"));
      const { requestors } = taskRequestData;

      if (taskRequestData.taskId && !taskRequestData.requestType) {
        taskPromises.push(tasksModel.fetchTask(taskRequestData.taskId));
        userPromises.push(Promise.all(requestors.map((requestor) => userModel.fetchUser({ userId: requestor }))));
        taskRequests.push(taskRequestData);
      } else if (dev) {
        newUserPromises.push(Promise.all(requestors.map((requestor) => userModel.fetchUser({ userId: requestor }))));
        newTaskRequestsModel.push(taskRequestData);
      }
    });

    const tasks = await Promise.all(taskPromises);
    const users = await Promise.all(userPromises);

    if (dev) {
      const newUsers = await Promise.all(newUserPromises);
      newTaskRequestsModel.forEach((taskRequest, index) => {
        taskRequest.requestors = newUsers[+index];
      });
    }

    taskRequests.forEach((taskRequest, index) => {
      taskRequest.task = tasks[+index].taskData;
      taskRequest.requestors = users[+index];
    });
  } catch (err) {
    logger.error("Error in updating task", err);
  }

  if (dev) {
    return [...taskRequests, ...newTaskRequestsModel];
  }
  return taskRequests;
};

const fetchPaginatedTaskRequests = async (queries = {}) => {
  try {
    let taskRequestsSnapshot = taskRequestsCollection;
    let { next, prev, size, q: queryString } = queries;
    if (size) size = parseInt(size);

    const rqlQueryParser = new RQLQueryParser(queryString);

    const filterQueries = rqlQueryParser.getFilterQueries();

    for (const [filterKey, filterValue] of Object.entries(filterQueries)) {
      const valuesList = filterValue
        .map((query) =>
          query.operator === Operators.INCLUDE ? Reflect.get(TASK_REQUEST_FILTER_VALUES, query.value) : null
        )
        .filter(Boolean);

      if (Reflect.has(TASK_REQUEST_FILTER_KEYS, filterKey)) {
        const fieldName = Reflect.get(TASK_REQUEST_FILTER_KEYS, filterKey);
        taskRequestsSnapshot = taskRequestsSnapshot.where(fieldName, "in", valuesList);
      }
    }

    const sortQueries = rqlQueryParser.getSortQueries();
    const sortQueryEntries = Object.entries(sortQueries);

    if (sortQueryEntries.length) {
      for (const [sortKey, sortValue] of sortQueryEntries) {
        if (Reflect.has(TASK_REQUEST_SORT_KEYS, sortKey) && Reflect.has(TASK_REQUEST_SORT_VALUES, sortValue)) {
          const sortField = Reflect.get(TASK_REQUEST_SORT_KEYS, sortKey);
          const orderDirection = Reflect.get(TASK_REQUEST_SORT_VALUES, sortValue);
          taskRequestsSnapshot = taskRequestsSnapshot.orderBy(sortField, orderDirection);
        }
      }
    } else {
      const defaultField = Reflect.get(TASK_REQUEST_SORT_KEYS, "created");
      taskRequestsSnapshot = taskRequestsSnapshot.orderBy(defaultField, "desc");
    }

    if (next) {
      const data = await taskRequestsCollection.doc(next).get();
      if (!data.data()) {
        return {
          statusCode: 400,
          error: "Bad Request",
          message: `${TASK_REQUEST_ERROR_MESSAGE.INVALID_NEXT}: ${next}`,
        };
      }
      taskRequestsSnapshot = taskRequestsSnapshot.startAfter(data).limit(size);
    } else if (prev) {
      const data = await taskRequestsCollection.doc(prev).get();
      if (!data.data()) {
        return {
          statusCode: 400,
          error: "Bad Request",
          message: `${TASK_REQUEST_ERROR_MESSAGE.INVALID_PREV}: ${prev}`,
        };
      }
      taskRequestsSnapshot = taskRequestsSnapshot.endBefore(data).limitToLast(size);
    } else if (size) {
      taskRequestsSnapshot = taskRequestsSnapshot.limit(size);
    }

    taskRequestsSnapshot = await taskRequestsSnapshot.get();
    const taskRequestsList = buildTaskRequests(taskRequestsSnapshot);
    await transformTaskRequests(taskRequestsList);

    const resultDataLength = taskRequestsSnapshot.docs.length;
    const isNextLinkRequired = size && resultDataLength === size;
    const lastVisibleDoc = isNextLinkRequired && taskRequestsSnapshot.docs[resultDataLength - 1];
    const firstDoc = taskRequestsSnapshot.docs[0];

    const nextPageParams = { ...queries, next: lastVisibleDoc?.id };
    delete nextPageParams.prev;

    const prevPageParams = { ...queries, prev: firstDoc?.id };
    delete prevPageParams.next;

    const nextLink = lastVisibleDoc ? generateLink(nextPageParams) : "";
    const prevLink = next || prev ? generateLink(prevPageParams) : "";

    return {
      data: taskRequestsList,
      next: nextLink,
      prev: prevLink,
    };
  } catch (err) {
    logger.error("error getting task requests", err);
    throw err;
  }
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

    if (!taskRequestData) {
      return {
        taskRequestExists: false,
      };
    }

    taskRequestData.id = taskRequestSnapshot.id;
    taskRequestData.url = new URL(`/taskRequests/${taskRequestData.id}`, config.get("services.rdsUi.baseUrl"));

    return {
      taskRequestData,
      taskRequestExists: true,
    };
  } catch (err) {
    logger.error("Error in fetching taskRequest by Id", err);
  }

  return {
    taskRequestExists: false,
  };
};

/**
 * Creates a task request with user details.
 *
 * @param {Object} data - The data for creating the task request.
 * @param {string} data.userId - The ID of the user to whom the task request is being created.
 * @param {string} data.proposedDeadline - The proposed deadline for the task.
 * @param {string} data.proposedStartDate - The proposed start date for the task.
 * @param {string} data.description - The description of the task request.
 * @param {string} data.markdownEnabled - If markdown is enabled in task request's description.
 * @param {string} data.taskTitle - The title of the task.
 * @param {string} data.taskId - The ID of the task (optional).
 * @param {string} data.externalIssueUrl - The external issue URL (optional).
 * @param {string} data.externalIssueHtmlUrl - The external issue HTML URL (optional).
 * @param {string} data.requestType - The type of the task request (CREATION | ASSIGNMENT).
 * @param {string} authorUserId - The ID of the authenticated user creating the request.
 * @returns {Promise<{
 *   isCreationRequestApproved: boolean | undefined,
 *   alreadyRequesting: boolean | undefined,
 *   id: string,
 *   isCreate: boolean,
 *   taskRequest: Object,
 * }>}
 */
const createRequest = async (data, authorUserId) => {
  try {
    return await firestore.runTransaction(async (transaction) => {
      const queryFieldPath = data.requestType === TASK_REQUEST_TYPE.CREATION ? "externalIssueUrl" : "taskId";
      const queryValue = data.requestType === TASK_REQUEST_TYPE.CREATION ? data.externalIssueUrl : data.taskId;
      const statusQueryValue =
        data.requestType === TASK_REQUEST_TYPE.CREATION
          ? [TASK_REQUEST_STATUS.PENDING, TASK_REQUEST_STATUS.APPROVED]
          : [TASK_REQUEST_STATUS.PENDING];

      const taskRequestsDocRef = taskRequestsCollection
        .where(queryFieldPath, "==", queryValue)
        .where("status", "in", statusQueryValue);
      const taskRequestsSnapshot = await transaction.get(taskRequestsDocRef);

      const [taskRequestRef] = taskRequestsSnapshot.docs;
      const taskRequestData = taskRequestRef?.data();
      const isCreationRequestApproved =
        taskRequestData &&
        taskRequestData.requestType === TASK_REQUEST_TYPE.CREATION &&
        taskRequestData.status === TASK_REQUEST_STATUS.APPROVED;
      if (isCreationRequestApproved) {
        return { isCreationRequestApproved };
      }
      const userRequest = {
        userId: data.userId,
        proposedDeadline: data.proposedDeadline,
        proposedStartDate: data.proposedStartDate,
        description: data.description,
        markdownEnabled: data?.markdownEnabled ?? false,
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
          usersCount: updatedUsers.length,
          lastModifiedBy: authorUserId,
          lastModifiedAt: Date.now(),
        };

        transaction.update(taskRequestsCollection.doc(taskRequestRef.id), updatedTaskRequest);
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
        externalIssueHtmlUrl: data.externalIssueHtmlUrl,
        requestType: data.requestType,
        users: [userRequest],
        usersCount: 1,
        createdBy: authorUserId,
        createdAt: Date.now(),
        lastModifiedBy: authorUserId,
        lastModifiedAt: Date.now(),
      };
      if (!newTaskRequest.externalIssueUrl) delete newTaskRequest.externalIssueUrl;
      if (!newTaskRequest.taskId) delete newTaskRequest.taskId;
      if (!newTaskRequest.taskTitle) delete newTaskRequest.taskTitle;

      const newTaskRequestsDocRef = taskRequestsCollection.doc();
      transaction.set(newTaskRequestsDocRef, newTaskRequest);

      return {
        isCreate: true,
        taskRequest: newTaskRequest,
        id: newTaskRequestsDocRef.id,
      };
    });
  } catch (err) {
    logger.error("Error creating a task request", err);
    throw err;
  }
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
 * Approve task request for a user.
 *
 * @param {string} taskRequestId - The ID of the task request.
 * @param {Object} user - The user to whom the task request is being approved.
 * @param {string} authorUserId - The ID of the authenticated user performing the approval.
 * @returns {Promise<{
 *   approvedTo: string,
 *   taskRequest: Object,
 *   taskRequestNotFound: boolean | undefined
 *   isUserInvalid: boolean | undefined
 *   isTaskRequestInvalid: boolean | undefined
 * }>}
 */
const approveTaskRequest = async (taskRequestId, user, authorUserId) => {
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

      let userRequestData;
      if (taskRequestData.users) {
        userRequestData = taskRequestData.users.find((userElement) => userElement.userId === user.id);
        if (userRequestData) userRequestData.status = TASK_REQUEST_STATUS.APPROVED;
      }

      const updatedTaskRequest = {
        users: taskRequestData.users,
        approvedTo: user.id,
        status: TASK_REQUEST_STATUS.APPROVED,
        lastModifiedBy: authorUserId,
        lastModifiedAt: Date.now(),
      };

      const currentEpochTime = getCurrentEpochTime();
      const newTaskRequestData = {
        assignee: user.id,
        title: taskRequestData.taskTitle,
        type: TASK_TYPE.FEATURE,
        percentCompleted: 0,
        status: TASK_STATUS.ASSIGNED,
        priority: DEFAULT_TASK_PRIORITY,
        createdAt: currentEpochTime,
        updatedAt: currentEpochTime,
        startedOn: convertMillisToSeconds(userRequestData?.createdAt || Date.now()),
        endsOn: convertMillisToSeconds(userRequestData?.proposedDeadline || Date.now()),
        github: {
          issue: {
            url: taskRequestData.externalIssueUrl,
            html_url: taskRequestData.externalIssueHtmlUrl,
          },
        },
      };

      const newTaskDocRef = tasksCollection.doc();
      const updateTaskRequestPromise = transaction.update(taskRequestDocRef, updatedTaskRequest);
      const addTaskPromise = transaction.set(newTaskDocRef, newTaskRequestData);

      await Promise.all([updateTaskRequestPromise, addTaskPromise]);

      return {
        approvedTo: user.username,
        taskRequest: {
          ...updatedTaskRequest,
          taskId: newTaskDocRef.id,
        },
      };
    });
  } catch (err) {
    logger.error("Error in approving task", err, {
      taskRequestId,
      user,
      errorDetails: err.message,
    });
    throw err;
  }
};

/**
 * Rejects a task request.
 *
 * @param {string} taskRequestId - The ID of the task request.
 * @param {string} authorUserId - The ID of the authenticated or logged in user performing the rejection.
 * @returns {Promise<{taskRequest: Object
 *   taskRequestNotFound: boolean | undefined
 *   isTaskRequestInvalid: boolean | undefined
 * }>}
 */
const rejectTaskRequest = async (taskRequestId, authorUserId) => {
  const taskRequestDoc = taskRequestsCollection.doc(taskRequestId);
  const taskRequestData = (await taskRequestDoc.get()).data();
  if (!taskRequestData) {
    return { taskRequestNotFound: true };
  }

  if (
    taskRequestData.status === TASK_REQUEST_STATUS.APPROVED ||
    taskRequestData.status === TASK_REQUEST_STATUS.DENIED
  ) {
    return { isTaskRequestInvalid: true };
  }
  const updatedTaskRequest = {
    status: TASK_REQUEST_STATUS.DENIED,
    lastModifiedBy: authorUserId,
    lastModifiedAt: Date.now(),
  };
  await taskRequestDoc.update(updatedTaskRequest);
  return { taskRequest: { ...taskRequestData, ...updatedTaskRequest } };
};

const addNewFields = async () => {
  const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

  const bulkWriter = firestore.bulkWriter();
  let documentsModified = 0;
  const totalDocuments = taskRequestsSnapshots.length;

  await Promise.all(
    taskRequestsSnapshots.map(async (taskRequestsSnapshot) => {
      const taskRequestData = taskRequestsSnapshot.data();
      if (!taskRequestData.requestType) {
        const { taskData } = await tasksModel.fetchTask(taskRequestData.taskId);
        const usersRequestList = taskRequestData.requestors.map((requestorId) => {
          let userStatus = TASK_REQUEST_STATUS.PENDING;

          if (taskRequestData.status === TASK_REQUEST_STATUS.APPROVED && requestorId === taskRequestData.approvedTo) {
            userStatus = TASK_REQUEST_STATUS.APPROVED;
          }

          return {
            userId: requestorId,
            status: userStatus,
          };
        });
        const updatedTaskRequestData = {
          ...taskRequestData,
          requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
          taskTitle: taskData.title,
          users: usersRequestList,
        };

        bulkWriter.update(taskRequestsCollection.doc(taskRequestsSnapshot.id), updatedTaskRequestData);
        documentsModified++;
      }
    })
  );

  await bulkWriter.close();
  return { documentsModified, totalDocuments };
};

const addUsersCountAndCreatedAt = async () => {
  const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

  const bulkWriter = firestore.bulkWriter();
  let documentsModified = 0;
  const totalDocuments = taskRequestsSnapshots.length;
  taskRequestsSnapshots.forEach((taskRequestsSnapshot) => {
    const taskRequestData = taskRequestsSnapshot.data();
    let isDocumentModified = false;
    if (!taskRequestData.usersCount) {
      taskRequestData.usersCount = taskRequestData.users.length;
      isDocumentModified = true;
    }
    if (!taskRequestData.createdAt) {
      taskRequestData.createdAt = taskRequestsSnapshot.createTime.toMillis();
      isDocumentModified = true;
    }

    if (isDocumentModified) {
      bulkWriter.update(taskRequestsCollection.doc(taskRequestsSnapshot.id), taskRequestData);
      documentsModified++;
    }
  });

  await bulkWriter.close();
  return { documentsModified, totalDocuments };
};
const removeOldField = async () => {
  const taskRequestsSnapshots = (await taskRequestsCollection.get()).docs;

  const bulkWriter = firestore.bulkWriter();
  let documentsModified = 0;
  const totalDocuments = taskRequestsSnapshots.length;
  taskRequestsSnapshots.forEach((taskRequestsSnapshot) => {
    const taskRequestData = taskRequestsSnapshot.data();
    if (taskRequestData.requestors || taskRequestData.approvedTo) {
      delete taskRequestData.requestors;
      delete taskRequestData.approvedTo;

      bulkWriter.set(taskRequestsCollection.doc(taskRequestsSnapshot.id), taskRequestData);
      documentsModified++;
    }
  });

  await bulkWriter.close();
  return { documentsModified, totalDocuments };
};

module.exports = {
  createRequest,
  fetchTaskRequests,
  fetchTaskRequestById,
  addOrUpdate,
  approveTaskRequest,
  fetchPaginatedTaskRequests,
  addNewFields,
  removeOldField,
  addUsersCountAndCreatedAt,
  rejectTaskRequest,
};
