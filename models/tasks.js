const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')
const userUtils = require('../utils/users')
const { fromFirestoreData, toFirestoreData } = require('../utils/tasks')
const { TASK_TYPE, TASK_STATUS } = require('../constants/tasks')

/**
 * Adds and Updates tasks
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @param taskId { string }: taskid which will be used to update the task in DB
 * @return {Promise<{taskId: string}>}
 */
const updateTask = async (taskData, taskId = null) => {
  try {
    taskData = await toFirestoreData(taskData)
    if (taskId) {
      const task = await tasksModel.doc(taskId).get()
      await tasksModel.doc(taskId).set({
        ...task.data(),
        ...taskData
      })
      return { taskId }
    }
    const taskInfo = await tasksModel.add(taskData)
    const result = {
      taskId: taskInfo.id,
      taskDetails: await fromFirestoreData(taskData)
    }

    return result
  } catch (err) {
    logger.error('Error in creating task', err)
    throw err
  }
}

/**
 * Fetch all tasks
 *
 * @return {Promise<tasks|Array>}
 */
const fetchTasks = async () => {
  try {
    const tasksSnapshot = await tasksModel.get()
    const tasks = []
    tasksSnapshot.forEach((task) => {
      tasks.push({
        id: task.id,
        ...task.data()
      })
    })
    const promises = tasks.map(async (task) => fromFirestoreData(task))
    const updatedTasks = await Promise.all(promises)
    return updatedTasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

/**
 * Fetch all participants whose task status is active
 *
 * @return {Promise<userIds|Set>}
 */

const fetchActiveTaskMembers = async () => {
  try {
    const tasksSnapshot = await tasksModel.where('type', '==', TASK_TYPE.FEATURE).where('status', '==', TASK_STATUS.ACTIVE).get()
    const activeMembers = new Set()
    if (!tasksSnapshot.empty) {
      tasksSnapshot.forEach((task) => {
        const { assignee } = task.data()
        activeMembers.add(
          assignee
        )
      })
    }
    return activeMembers
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

/**
 * Fetch a task
 * @param taskId { string }: taskid which will be used to fetch the task
 * @return {Promise<taskData|Object>}
 */
const fetchTask = async (taskId) => {
  try {
    const task = await tasksModel.doc(taskId).get()
    const taskData = task.data()
    return { taskData: await fromFirestoreData(taskData) }
  } catch (err) {
    logger.error('Error retrieving task data', err)
    throw err
  }
}

/**
 * Fetch all the active and blocked tasks of the user
 *
 * @return {Promise<tasks|Array>}
 */

/**
 * Fetch all tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserTasks = async (username, statuses = []) => {
  try {
    const userId = await userUtils.getUserId(username)

    if (!userId) {
      return { userNotFound: true }
    }

    let tasksSnapshot = []
    let assigneeSnapshot = []

    if (statuses && statuses.length) {
      tasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .where('status', 'in', statuses)
        .get()
      assigneeSnapshot = await tasksModel.where('assignee', '==', userId)
        .where('status', 'in', statuses)
        .get()
    } else {
      tasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .get()

      assigneeSnapshot = await tasksModel.where('assignee', '==', userId)
        .get()
    }

    const tasks = []

    if (!tasksSnapshot.empty) {
      tasksSnapshot.forEach((task) => {
        tasks.push({
          id: task.id,
          ...task.data()
        })
      })
    }

    if (!assigneeSnapshot.empty) {
      assigneeSnapshot.forEach((task) => {
        tasks.push({
          id: task.id,
          ...task.data()
        })
      })
    }

    const promises = tasks.map(async (task) => fromFirestoreData(task))
    const updatedTasks = await Promise.all(promises)
    return updatedTasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

const fetchUserActiveAndBlockedTasks = async (username) => {
  return await fetchUserTasks(username, ['active', 'pending', 'blocked'])
}

/**
 * Fetch all the completed tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserCompletedTasks = async (username) => {
  return await fetchUserTasks(username, ['completed'])
}

/**
 * Fetch all the active tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserActiveTasks = async (username) => {
  return await fetchUserTasks(username, ['active'])
}

module.exports = {
  updateTask,
  fetchTasks,
  fetchTask,
  fetchUserTasks,
  fetchUserActiveTasks,
  fetchUserActiveAndBlockedTasks,
  fetchUserCompletedTasks,
  fetchActiveTaskMembers
}
