const firestore = require("../utils/firestore");
const tasksModel = firestore.collection("tasks");
const ItemModel = firestore.collection("itemTags");
const dependencyModel = firestore.collection("taskDependencies");
const userUtils = require("../utils/users");
const { fromFirestoreData, toFirestoreData, buildTasks } = require("../utils/tasks");
const { TASK_TYPE, TASK_STATUS, TASK_STATUS_OLD } = require("../constants/tasks");
const { IN_PROGRESS, BLOCKED, SMOKE_TESTING, COMPLETED } = TASK_STATUS;
const { OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING, OLD_COMPLETED } = TASK_STATUS_OLD;
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
      if (taskData.status === "VERIFIED") {
        taskData = { ...taskData, endsOn: Math.floor(Date.now() / 1000) };
      }
      await tasksModel.doc(taskId).set({
        ...task.data(),
        ...taskData,
      });
      return { taskId };
    }
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
    for (const dependsId of dependsOn) {
      const taskDependOn = {
        taskId,
        dependsId,
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
const fetchTasks = async () => {
  try {
    const tasksSnapshot = await tasksModel.get();
    const dependencySnapshot = await dependencyModel.get();
    const tasks = buildTasks(tasksSnapshot, dependencySnapshot);
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
    const taskData = await fromFirestoreData(task.data());
    if (taskData?.status) {
      taskData.status = TASK_STATUS[taskData.status.toUpperCase()] || task.status;
    }
    return { taskData };
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
  return await fetchUserTasks(username, [], "startedOn", "desc");
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
};
