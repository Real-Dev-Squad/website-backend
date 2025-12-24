const firestore = require("../utils/firestore");
const tasksModel = firestore.collection("tasks");
const userModel = firestore.collection("users");
const ItemModel = firestore.collection("itemTags");
const dependencyModel = firestore.collection("taskDependencies");
const userUtils = require("../utils/users");
const { chunks } = require("../utils/array");
const { DOCUMENT_WRITE_SIZE } = require("../constants/constants");
const { fromFirestoreData, toFirestoreData, buildTasks } = require("../utils/tasks");
const { TASK_TYPE, TASK_STATUS, TASK_STATUS_OLD, TASK_SIZE, COMPLETED_TASK_STATUS } = require("../constants/tasks");
const {
  IN_PROGRESS,
  NEEDS_REVIEW,
  IN_REVIEW,
  ASSIGNED,
  BLOCKED,
  SMOKE_TESTING,
  COMPLETED,
  SANITY_CHECK,
  BACKLOG,
  DONE,
  AVAILABLE,
} = TASK_STATUS;
const { OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING, OLD_COMPLETED } = TASK_STATUS_OLD;
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");

/**
 * Update multiple tasks' status to DONE in one batch operation.
 * @param {Object[]} tasksData - Tasks data to update, must contain 'id' and 'status' fields.
 * @returns {Object} - Summary of the batch operation.
 * @property {number} totalUpdatedStatus - Number of tasks that has their status updated to DONE.
 * @property {number} totalOperationsFailed - Number of tasks that failed to update.
 * @property {string[]} updatedTaskDetails - IDs of tasks that has their status updated to DONE.
 * @property {string[]} failedTaskDetails - IDs of tasks that failed to update.
 */
const updateTaskStatusToDone = async (tasksData) => {
  const batch = firestore.batch();
  const tasksBatch = [];
  const summary = {
    totalUpdatedStatus: 0,
    totalOperationsFailed: 0,
    updatedTaskDetails: [],
    failedTaskDetails: [],
  };
  tasksData.forEach((task) => {
    const updateTaskData = { ...task, status: "DONE" };
    batch.update(tasksModel.doc(task.id), updateTaskData);
    tasksBatch.push(task.id);
  });
  try {
    await batch.commit();
    summary.totalUpdatedStatus += tasksData.length;
    summary.updatedTaskDetails = [...tasksBatch];
    return { ...summary };
  } catch (err) {
    logger.error("Firebase batch Operation Failed!");
    summary.totalOperationsFailed += tasksData.length;
    summary.failedTaskDetails = [...tasksBatch];
    return { ...summary };
  }
};

/**
 * Adds and Updates tasks
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @param taskId { string }: taskid which will be used to update the task in DB
 * @return {Promise<{taskId: string}>}
 */
const updateTask = async (taskData, taskId = null) => {
  try {
    taskData = await toFirestoreData(taskData);
    if (taskId) {
      const task = await tasksModel.doc(taskId).get();
      if (taskData?.assignee && task.data().status === TASK_STATUS.AVAILABLE) {
        taskData = { ...taskData, status: TASK_STATUS.ASSIGNED };
      }
      if (taskData.status === "VERIFIED") {
        taskData = { ...taskData, endsOn: Math.floor(Date.now() / 1000) };
      }
      const { dependsOn, ...taskWithoutDependsOn } = taskData;
      const updatedAt = Date.now();
      const createdAt = task.data().createdAt ? { createdAt: task.data().createdAt } : {};
      await tasksModel.doc(taskId).set({
        ...task.data(),
        ...taskWithoutDependsOn,
        ...createdAt,
        updatedAt,
      });
      if (dependsOn) {
        await firestore.runTransaction(async (transaction) => {
          const dependencyQuery = dependencyModel.where("taskId", "==", taskId);
          const existingDependenciesSnapshot = await transaction.get(dependencyQuery);
          const existingDependsOnIds = existingDependenciesSnapshot.docs.map((doc) => doc.data().dependsOn);
          const newDependencies = dependsOn.filter((dependency) => !existingDependsOnIds.includes(dependency));
          if (newDependencies.length > 0) {
            for (const dependency of newDependencies) {
              const dependencyDoc = await tasksModel.doc(dependency).get();
              if (dependencyDoc.exists) {
                const taskDependsOn = {
                  taskId: taskId,
                  dependsOn: dependency,
                };
                const docRef = dependencyModel.doc();
                transaction.set(docRef, taskDependsOn);
              } else {
                throw new Error("Invalid dependency passed");
              }
            }
          }
        });
      }
      return { taskId };
    }
    taskData.createdAt = Date.now();
    const taskInfo = await tasksModel.add(taskData);
    const result = {
      taskId: taskInfo.id,
      taskDetails: await fromFirestoreData(taskData),
    };
    return result;
  } catch (err) {
    logger.error("Error in updating task", err);
    throw err;
  }
};
const addDependency = async (data) => {
  try {
    const { taskId, dependsOn } = data;
    const batch = firestore.batch();
    if (dependsOn.length > 500) {
      throw new Error("Error cannot add more than 500 taskId");
    }
    for (const dependency of dependsOn) {
      const taskDependOn = {
        taskId: taskId,
        dependsOn: dependency,
      };
      const docid = dependencyModel.doc();
      batch.set(docid, taskDependOn);
    }
    await batch.commit();
    return data.dependsOn;
  } catch (err) {
    logger.error("Error in creating dependency");
    throw err;
  }
};

/**
 * Fetch all tasks
 *
 * @return {Promise<tasks|Array>}
 */

const getBuiltTasks = async (tasksSnapshot, searchTerm) => {
  const tasks = buildTasks(tasksSnapshot);
  const promises = tasks.map(async (task) => fromFirestoreData(task));
  let updatedTasks = await Promise.all(promises);

  if (searchTerm) {
    updatedTasks = updatedTasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  const taskPromises = updatedTasks.map(async (task) => {
    if (task.status) {
      task.status = TASK_STATUS[task.status.toUpperCase()] || task.status;
    }

    const taskId = task.id;
    const dependencySnapshot = await dependencyModel.where("taskId", "==", taskId).get();
    task.dependsOn = [];
    dependencySnapshot.docs.forEach((doc) => {
      const dependency = doc.get("dependsOn");
      task.dependsOn.push(dependency);
    });
    return task;
  });
  const taskList = await Promise.all(taskPromises);
  return taskList;
};

const fetchPaginatedTasks = async ({
  status = "",
  size = TASK_SIZE,
  page,
  next,
  prev,
  assignee,
  title,
  userFeatureFlag,
}) => {
  try {
    let initialQuery = tasksModel;

    if (assignee) {
      const assignees = assignee.split(",");
      const users = [];
      for (const singleAssignee of assignees) {
        const user = await userUtils.getUserId(singleAssignee);
        if (user) {
          users.push(user);
        }
      }

      if (users.length > 1) {
        initialQuery = initialQuery.where("assignee", "in", users);
      } else if (users.length === 1) {
        initialQuery = initialQuery.where("assignee", "==", users[0]);
      } else {
        return {
          allTasks: [],
          next: "",
          prev: "",
        };
      }
    }

    if (status === TASK_STATUS.OVERDUE) {
      const currentTime = Math.floor(Date.now() / 1000);
      const OVERDUE_TASK_STATUSES = [
        IN_PROGRESS,
        ASSIGNED,
        NEEDS_REVIEW,
        IN_REVIEW,
        SMOKE_TESTING,
        BLOCKED,
        SANITY_CHECK,
      ];
      initialQuery = initialQuery
        .where("endsOn", "<", currentTime)
        .where("status", "in", OVERDUE_TASK_STATUSES)
        .orderBy("endsOn", "desc");
      /**
       * Setting it undefined because when OVERDUE condition is applied, where 2 inEquality checks are being made
       * firestore don't allow more inEquality checks, so for title where 2 more inEquality checks are being added,
       * it will give error
       */
      title = undefined;
    } else if (status) {
      if (userFeatureFlag === "true" && [DONE, COMPLETED].includes(status)) {
        initialQuery = initialQuery.where("status", "in", [DONE, COMPLETED]);
      } else {
        initialQuery = initialQuery.where("status", "==", status);
      }
    }

    if (title) {
      initialQuery = initialQuery
        .where("title", ">=", title)
        .where("title", "<=", title + "\uf8ff")
        .orderBy("title", "asc");
    }

    initialQuery = initialQuery.orderBy("updatedAt", "desc");

    let queryDoc = initialQuery;

    if (prev) {
      queryDoc = queryDoc.limitToLast(size);
    } else {
      queryDoc = queryDoc.limit(size);
    }

    if (page) {
      const startAfter = size * page;
      queryDoc = queryDoc.offset(startAfter);
    } else if (next) {
      const doc = await tasksModel.doc(next).get();
      queryDoc = queryDoc.startAt(doc);
    } else if (prev) {
      const doc = await tasksModel.doc(prev).get();
      queryDoc = queryDoc.endAt(doc);
    }

    const snapshot = await queryDoc.get();
    let nextDoc, prevDoc;
    if (snapshot.size) {
      const first = snapshot.docs[0];
      prevDoc = await initialQuery.endBefore(first).limitToLast(1).get();

      const last = snapshot.docs[snapshot.docs.length - 1];
      nextDoc = await initialQuery.startAfter(last).limit(1).get();
    }

    const allTasks = await getBuiltTasks(snapshot);

    return {
      allTasks,
      next: nextDoc?.docs[0]?.id ?? "",
      prev: prevDoc?.docs[0]?.id ?? "",
    };
  } catch (err) {
    logger.error("Error retrieving user data", err);
    throw err;
  }
};

const fetchTasks = async (searchTerm) => {
  try {
    const tasksSnapshot = await tasksModel.get();
    const taskList = await getBuiltTasks(tasksSnapshot, searchTerm);
    return taskList;
  } catch (err) {
    logger.error("error getting tasks", err);
    throw err;
  }
};

/**
 * Fetch all participants whose task status is active
 *
 * @return {Promise<userIds|Set>}
 */

const fetchActiveTaskMembers = async () => {
  try {
    const status = [OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING, IN_PROGRESS, BLOCKED, SMOKE_TESTING];
    const tasksSnapshot = await tasksModel.where("type", "==", TASK_TYPE.FEATURE).where("status", "in", status).get();
    const activeMembers = new Set();
    if (!tasksSnapshot.empty) {
      tasksSnapshot.forEach((task) => {
        const { assignee } = task.data();
        activeMembers.add(assignee);
      });
    }
    return activeMembers;
  } catch (err) {
    logger.error("error getting tasks", err);
    throw err;
  }
};

/**
 * Fetch a task
 * @param taskId { string }: taskid which will be used to fetch the task
 * @return {Promise<taskData|Object>}
 */
const fetchTask = async (taskId) => {
  try {
    const task = await tasksModel.doc(taskId).get();
    const dependencySnapshot = await dependencyModel.where("taskId", "==", taskId).get();
    const dependencyDocReference = dependencySnapshot.docs.map((doc) => {
      const dependency = doc.get("dependsOn");
      return dependency;
    });
    const taskData = await fromFirestoreData(task.data());
    if (taskData?.status) {
      taskData.status = TASK_STATUS[taskData.status.toUpperCase()] || task.status;
    }
    return { taskData, dependencyDocReference };
  } catch (err) {
    logger.error("Error retrieving task data", err);
    throw err;
  }
};

/**
 * Fetch a task against the IssueId
 * @param issueId { number }: issueId which will be used to fetch the task
 * @return {Promise<taskData|Object>}
 */
const fetchTaskByIssueId = async (issueId) => {
  try {
    const task = await tasksModel.where("github.issue.id", "==", issueId).get();
    const [taskDoc] = task.docs;
    let updatedTaskData;
    if (taskDoc) {
      updatedTaskData = { id: taskDoc.id, ...taskDoc.data() };
    }
    const taskData = await fromFirestoreData(updatedTaskData);

    if (taskData?.status) {
      taskData.status = TASK_STATUS[taskData.status.toUpperCase()];
    }

    return taskData;
  } catch (err) {
    logger.error("Error retrieving task data from issue Id", err);
    throw err;
  }
};

/**
 * Fetch assigned self task
 * @param taskId { string }: taskId which will be used to fetch the task
 * @param id { string }: id to check task is assigned to self or not
 * @return {Promsie<taskData|Object>}
 */
const fetchSelfTask = async (taskId, userId) => {
  try {
    const task = await tasksModel.doc(taskId).get();
    const taskData = task.data();
    if (!taskData) return { taskNotFound: true };
    if (userId !== taskData.assignee) return { notAssignedToYou: true };
    const taskfromFirestoreData = await fromFirestoreData(taskData);
    const taskList = {
      ...taskfromFirestoreData,
      status: TASK_STATUS[taskfromFirestoreData.status.toUpperCase()] || task.status,
    };
    return { taskData: taskList };
  } catch (err) {
    logger.error("Error retrieving self task data", err);
    throw err;
  }
};

/**
 * Fetch all tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserTasks = async (username, statuses = [], field, order) => {
  try {
    const userId = await userUtils.getUserId(username);

    if (!userId) {
      return { userNotFound: true };
    }

    let groupTasksSnapshot = [];
    let featureTasksSnapshot = [];

    if (statuses && statuses.length) {
      if (field) {
        groupTasksSnapshot = await tasksModel
          .where("participants", "array-contains", userId)
          .where("status", "in", statuses)
          .orderBy(field, order)
          .get();
        featureTasksSnapshot = await tasksModel
          .where("assignee", "==", userId)
          .where("status", "in", statuses)
          .orderBy(field, order)
          .get();
      } else {
        groupTasksSnapshot = await tasksModel
          .where("participants", "array-contains", userId)
          .where("status", "in", statuses)
          .get();
        featureTasksSnapshot = await tasksModel.where("assignee", "==", userId).where("status", "in", statuses).get();
      }
    } else {
      if (field) {
        groupTasksSnapshot = await tasksModel
          .where("participants", "array-contains", userId)
          .orderBy(field, order)
          .get();
        featureTasksSnapshot = await tasksModel.where("assignee", "==", userId).orderBy(field, order).get();
      } else {
        groupTasksSnapshot = await tasksModel.where("participants", "array-contains", userId).get();
        featureTasksSnapshot = await tasksModel.where("assignee", "==", userId).get();
      }
    }

    const groupTasks = buildTasks(groupTasksSnapshot);
    const tasks = buildTasks(featureTasksSnapshot, groupTasks);

    const promises = tasks.map(async (task) => fromFirestoreData(task));
    const updatedTasks = await Promise.all(promises);
    const taskList = updatedTasks.map((task) => {
      task.status = TASK_STATUS[task.status.toUpperCase()] || task.status;
      return task;
    });
    return taskList;
  } catch (err) {
    logger.error("error getting tasks", err);
    throw err;
  }
};

const getNewTask = async (skill = undefined, level = undefined) => {
  const availableTasks = await tasksModel.where("status", "==", TASK_STATUS.AVAILABLE).get();
  const idArray = [];

  let task;

  if (!availableTasks.empty) {
    availableTasks.forEach((item) => idArray.push(item.id));

    if (!skill) {
      task = await ItemModel.where("itemType", "==", "TASK").where("levelValue", "<=", 2).get();
    } else {
      task = await ItemModel.where("tagName", "==", skill)
        .where("itemType", "==", "TASK")
        .where("levelValue", ">=", level)
        .where("levelValue", "<=", level + 2)
        .get();
    }
  }

  if (!task.empty) {
    let taskData, id;
    for (const doc of task.docs) {
      if (idArray.includes(doc.data().itemId)) {
        id = doc.id;
        taskData = doc.data();
        break;
      }
    }
    if (taskData) {
      return {
        task: {
          id,
          ...taskData,
        },
      };
    }
  }
  return { taskNotFound: true };
};

/**
 *
 * @param skill { string } : skill category which will be used
 * @param level { number } : level of the skill
 * @returns {Promise<task>|object}
 */

const fetchSkillLevelTask = async (userId) => {
  try {
    let task;
    const data = await ItemModel.where("itemId", "==", userId).where("tagType", "==", "SKILL").limit(10).get();
    const userSkills = [];

    if (data.empty) {
      task = await getNewTask();
    } else {
      data.forEach((doc) => {
        const skill = doc.data().tagName;
        const level = doc.data().levelValue;
        userSkills.push({ skill, level });
      });
      const { skill, level } = userUtils.getLowestLevelSkill(userSkills);
      task = await getNewTask(skill, level);
    }

    return task;
  } catch (err) {
    logger.error("error getting tasks", err);
    throw err;
  }
};

/**
 *
 * @param username { string } : username which will be used to fetch all self tasks
 * @returns {Promise<tasks>|Array}
 */
const fetchSelfTasks = async (username) => {
  return await fetchUserTasks(username, []);
  // Removed `startedOn` field since we are getting issues with some of the documents in the tasks collection as some of the documents dont have `startedOn` present.
};

/**
 * Fetch all the completed tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserCompletedTasks = async (username) => {
  return await fetchUserTasks(username, [OLD_COMPLETED, COMPLETED]);
};

/**
 * Fetch all overdue tasks
 * @param overdueTasks <Array>: tasks which are overdue
 * @return {Promsie<Array>}
 */
const overdueTasks = async (overDueTasks) => {
  try {
    const newAvailableTasks = await Promise.all(
      overDueTasks.map(async (task) => {
        const { assignee, id } = task;
        await tasksModel.doc(id).update({
          status: TASK_STATUS.AVAILABLE,
          assignee: null,
          endsOn: null,
          startedOn: null,
        });
        const { taskData: unassignedTask } = await fetchTask(id);
        return {
          unassignedMember: assignee,
          unassignedTask,
        };
      })
    );
    return newAvailableTasks;
  } catch (err) {
    logger.error("error updating to new task workflow", err);
    throw err;
  }
};

/**
 * @param {Number} [days] - Number of days (optional, default is 0)
 * @returns {Array} - tasks which are overdue
 * @throws {Error} - If error occurs while fetching tasks
 **/
const getOverdueTasks = async (days = 0) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const targetTime = days > 0 ? currentTime + days * 24 * 60 * 60 : currentTime;

    const completeTaskStatuses = Object.values(COMPLETED_TASK_STATUS);

    const query = tasksModel
      .where("endsOn", "<", targetTime)
      .where("status", "not-in", [...completeTaskStatuses, BACKLOG, AVAILABLE]);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    const taskData = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return taskData;
  } catch (err) {
    logger.error("Error in getting overdue tasks", err);
    throw err;
  }
};

const updateTaskStatus = async () => {
  try {
    const snapshot = await tasksModel.where("status", "==", "COMPLETED").get();
    const tasksStatusCompleted = [];
    let summary = {
      totalTasks: snapshot.size,
      totalUpdatedStatus: 0,
      totalOperationsFailed: 0,
      updatedTaskDetails: [],
      failedTaskDetails: [],
    };

    if (snapshot.size === 0) {
      return summary;
    }

    snapshot.forEach((task) => {
      const id = task.id;
      const taskData = task.data();
      tasksStatusCompleted.push({ ...taskData, id });
    });
    const taskStatusCompletedChunks = chunks(tasksStatusCompleted, DOCUMENT_WRITE_SIZE);

    const updatedTasksPromises = await Promise.all(
      taskStatusCompletedChunks.map(async (tasks) => {
        const res = await updateTaskStatusToDone(tasks);
        return {
          totalUpdatedStatus: res.totalUpdatedStatus,
          totalOperationsFailed: res.totalOperationsFailed,
          updatedTaskDetails: res.updatedTaskDetails,
          failedTaskDetails: res.failedTaskDetails,
        };
      })
    );

    updatedTasksPromises.forEach((res) => {
      summary = {
        ...summary,
        totalUpdatedStatus: (summary.totalUpdatedStatus += res.totalUpdatedStatus),
        totalOperationsFailed: (summary.totalOperationsFailed += res.totalOperationsFailed),
        updatedTaskDetails: [...summary.updatedTaskDetails, ...res.updatedTaskDetails],
        failedTaskDetails: [...summary.failedTaskDetails, ...res.failedTaskDetails],
      };
    });

    if (summary.totalOperationsFailed === summary.totalTasks) {
      throw Error(INTERNAL_SERVER_ERROR);
    }

    return summary;
  } catch (error) {
    logger.error(`Error in updating task status:  ${error}`);
    throw error;
  }
};

const updateOrphanTasksStatus = async () => {
  try {
    const users = [];
    const batch = firestore.batch();
    const usersQuerySnapshot = await userModel.where("roles.in_discord", "==", false).get();

    usersQuerySnapshot.forEach((user) => users.push({ ...user.data(), id: user.id }));

    let orphanTasksUpdatedCount = 0;

    for (const user of users) {
      const tasksQuerySnapshot = await tasksModel
        .where("assignee", "==", user.id)
        .where("status", "not-in", [BACKLOG, COMPLETED, DONE])
        .get();
      tasksQuerySnapshot.forEach((taskDoc) => {
        orphanTasksUpdatedCount++;
        const taskRef = tasksModel.doc(taskDoc.id);
        batch.update(taskRef, { status: BACKLOG, updated_at: Date.now() });
      });
    }

    await batch.commit();
    return { orphanTasksUpdatedCount };
  } catch (error) {
    logger.error("Error marking tasks as backlog:", error);
    throw error;
  }
};

const markUnDoneTasksOfArchivedUsersBacklog = async (users) => {
  try {
    let orphanTasksUpdatedCount = 0;
    const batch = firestore.batch();
    for (const user of users) {
      const tasksQuerySnapshot = await tasksModel
        .where("assignee", "==", user.id)
        .where("status", "not-in", [COMPLETED, DONE, BACKLOG])
        .get();
      tasksQuerySnapshot.forEach((taskDoc) => {
        orphanTasksUpdatedCount++;
        const taskRef = tasksModel.doc(taskDoc.id);
        batch.update(taskRef, { status: BACKLOG, updated_at: Date.now() });
      });
    }

    await batch.commit();
    return orphanTasksUpdatedCount;
  } catch (error) {
    logger.error("Error marking tasks as backlog:", error);
    throw error;
  }
};

/**
 * Fetches all incomplete tasks for given user IDs.
 *
 * @param {string[]} userIds - The IDs of the users to fetch incomplete tasks for.
 * @returns {Promise<firebase.firestore.QuerySnapshot>} - The query snapshot object.
 * @throws {Error} - Throws an error if the database query fails.
 */
const fetchIncompleteTasksByUserIds = async (userIds) => {
  const COMPLETED_STATUSES = [DONE, COMPLETED];

  if (!userIds || userIds.length === 0) {
    return [];
  }
  try {
    const userIdChunks = [];

    for (let i = 0; i < userIds.length; i += BATCH_SIZE_IN_CLAUSE) {
      userIdChunks.push(userIds.slice(i, i + BATCH_SIZE_IN_CLAUSE));
    }

    const promises = userIdChunks.map(async (userIdChunk) => {
      const querySnapshot = await tasksModel.where("assignee", "in", userIdChunk).get();
      return querySnapshot.docs.map((doc) => doc.data());
    });

    const snapshots = await Promise.all(promises);

    const incompleteTasks = snapshots.flat();

    const incompleteTaskForUsers = incompleteTasks.filter((task) => !COMPLETED_STATUSES.includes(task.status));

    return incompleteTaskForUsers;
  } catch (error) {
    logger.error("Error when fetching incomplete tasks for users:", error);
    throw error;
  }
};

module.exports = {
  updateTask,
  fetchTasks,
  fetchTask,
  fetchUserTasks,
  fetchSelfTasks,
  fetchUserCompletedTasks,
  fetchActiveTaskMembers,
  fetchSelfTask,
  fetchSkillLevelTask,
  overdueTasks,
  addDependency,
  fetchTaskByIssueId,
  fetchPaginatedTasks,
  getBuiltTasks,
  getOverdueTasks,
  updateTaskStatus,
  updateOrphanTasksStatus,
  markUnDoneTasksOfArchivedUsersBacklog,
  updateTaskStatusToDone,
  fetchIncompleteTasksByUserIds,
};
