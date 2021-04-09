const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')
const { fetchUser } = require('./users')
const userUtils = require('../utils/users')

const convertUserIdsToUsernames = async (task) => {
  if (!task) {
    return task
  }
  const { getUsername, getParticipantUsernames } = userUtils
  let { ownerId, createdBy, assignedTo, participants } = task
  if (ownerId) {
    ownerId = await getUsername(ownerId)
  }
  if (createdBy) {
    createdBy = await getUsername(createdBy)
  }
  if (assignedTo) {
    assignedTo = await getUsername(assignedTo)
  }

  if (participants) {
    participants = await getParticipantUsernames(participants)
  }

  return {
    ...task,
    ownerId,
    createdBy,
    assignedTo,
    participants
  }
}

const convertUsernamesToUserIds = async (task) => {
  if (!task) {
    return task
  }
  const updatedTask = { ...task }
  const { getUserId, getParticipantUserIds } = userUtils
  const { ownerId, createdBy, assignedTo, participants } = task
  if (ownerId) {
    updatedTask.ownerId = await getUserId(ownerId)
  }
  if (createdBy) {
    updatedTask.createdBy = await getUserId(createdBy)
  }
  if (assignedTo) {
    updatedTask.assignedTo = await getUserId(assignedTo)
  }

  if (participants) {
    updatedTask.participants = await getParticipantUserIds(participants)
  }
  return updatedTask
}

/**
 * Adds and Updates tasks
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @param taskId { string }: taskid which will be used to update the task in DB
 * @return {Promise<{taskId: string}>}
 */
const updateTask = async (taskData, taskId = null) => {
  try {
    taskData = await convertUsernamesToUserIds(taskData)
    if (taskId) {
      const task = await tasksModel.doc(taskId).get()
      await tasksModel.doc(taskId).set({
        ...task.data(),
        ...taskData
      })
      return { taskId }
    }
    const taskInfo = await tasksModel.add(taskData)

    return { taskId: taskInfo.id, taskDetails: await convertUserIdsToUsernames(taskData) }
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
    const promises = tasks.map(async (task) => convertUserIdsToUsernames(task))
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
 * @return {Promise<tasks|Array>}
 */

const fetchActiveTaskMembers = async () => {
  try {
    const tasksSnapshot = await tasksModel.where('status', '==', 'active').get()
    const activeMembers = []
    tasksSnapshot.forEach((task) => {
      const taskData = task.data()
      if (taskData.participants) {
        activeMembers.push(
          ...taskData.participants
        )
      }
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
    const taskData = task.data()
    return { taskData: await convertUserIdsToUsernames(taskData) }
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
    const { user } = await fetchUser({ username })
    const userId = await userUtils.getUserId(user.username)
    let tasksSnapshot = []
    if (statuses && statuses.length) {
      tasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .where('status', 'in', statuses)
        .get()
    } else {
      tasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .get()
    }

    const tasks = []
    tasksSnapshot.forEach((task) => {
      tasks.push({
        id: task.id,
        ...task.data()
      })
    })
    const promises = tasks.map(async (task) => convertUserIdsToUsernames(task))
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

module.exports = {
  updateTask,
  fetchTasks,
  fetchTask,
  fetchUserTasks,
  fetchUserActiveAndBlockedTasks,
  fetchUserCompletedTasks,
  fetchActiveTaskMembers
}
