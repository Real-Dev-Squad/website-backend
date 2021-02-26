const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')
const { fetchUser } = require('./users')
/**
 * Adds and Updates tasks
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @param taskId { string }: taskid which will be used to update the task in DB
 * @return {Promise<{taskId: string}>}
 */
const updateTask = async (taskData, taskId = null) => {
  try {
    if (taskId) {
      const task = await tasksModel.doc(taskId).get()
      await tasksModel.doc(taskId).set({
        ...task.data(),
        ...taskData
      })
      return { taskId }
    }
    const taskInfo = await tasksModel.add(taskData)
    const newlyCreatedTaskData = await fetchTask(taskInfo.id)
    return { taskId: taskInfo.id, taskDetails: newlyCreatedTaskData.taskData }
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
    return tasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

/**
 * Fetch all participants whose task status is active
 *
 * @return {Promise<tasks|Array>}
 */

const fetchActiveTaskMembers = async () => {
  try {
    const tasksSnapshot = await tasksModel.where('status', '==', 'active').get()
    const activeMembers = []
    tasksSnapshot.forEach((task) => {
      activeMembers.push(
        ...task.data().participants
      )
    })
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
    return { taskData: task.data() }
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

const fetchUserTasks = async (username) => {
  try {
    const { user } = await fetchUser({ username })
    const tasksSnapshot = await tasksModel.where('participants', 'array-contains', user.username).get()
    const tasks = []
    tasksSnapshot.forEach((task) => {
      tasks.push({
        id: task.id,
        ...task.data()
      })
    })
    return tasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

const fetchUserActiveAndBlockedTasks = async (username) => {
  try {
    const { user } = await fetchUser({ username })

    const tasksSnapshot = await tasksModel.where('participants', 'array-contains', user.username).where('status', 'in', ['active', 'pending', 'blocked']).get()
    const tasks = []
    tasksSnapshot.forEach((task) => {
      tasks.push({
        id: task.id,
        ...task.data()
      })
    })

    return tasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

/**
 * Fetch all the completed tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserCompletedTasks = async (username) => {
  try {
    const { user } = await fetchUser({ username })
    const tasksSnapshot = await tasksModel.where('participants', 'array-contains', user.username).where('status', '==', 'completed').get()
    const tasks = []
    tasksSnapshot.forEach((task) => {
      tasks.push({
        id: task.id,
        ...task.data()
      })
    })

    return tasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

module.exports = {
  updateTask,
  fetchTasks,
  fetchTask,
  fetchUserTasks,
  fetchUserActiveAndBlockedTasks,
  fetchUserCompletedTasks,
  fetchActiveTaskMembers
}
