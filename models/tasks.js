const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')
const userUtils = require('../utils/users')
const { fromFirestoreData, toFirestoreData, buildTasks } = require('../utils/tasks')
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
    logger.error('Error in updating task', err)
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
    const tasks = buildTasks(tasksSnapshot)
    const promises = tasks.map(async (task) => fromFirestoreData(task))
    const updatedTasks = await Promise.all(promises)
    const taskList = updatedTasks.map(task => {
      task.status = TASK_STATUS[task.status.toUpperCase()]
      return task
    })
    return taskList
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
    const status = ['active', 'blocked', 'pending', 'IN_PROGRESS', 'BLOCKED', 'SMOKE_TESTING']
    const tasksSnapshot = await tasksModel.where('type', '==', TASK_TYPE.FEATURE).where('status', 'in', status).get()
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
    const taskData = await fromFirestoreData(task.data())
    if (taskData?.status) {
      taskData.status = TASK_STATUS[taskData.status.toUpperCase()]
    }
    return { taskData }
  } catch (err) {
    logger.error('Error retrieving task data', err)
    throw err
  }
}

/**
 * Fetch assigned self task
 * @param taskId { string }: taskId which will be used to fetch the task
 * @param id { string }: id to check task is assigned to self or not
 * @return {Promsie<taskData|Object>}
 */
const fetchSelfTask = async (taskId, userId) => {
  try {
    const task = await tasksModel.doc(taskId).get()
    const taskData = task.data()
    if (!taskData) return { taskNotFound: true }
    if (userId !== taskData.assignee) return { notAssignedToYou: true }
    const taskfromFirestoreData = await fromFirestoreData(taskData)
    const taskList = { ...taskfromFirestoreData, status: TASK_STATUS[taskfromFirestoreData.status.toUpperCase()] }
    return { taskData: taskList }
  } catch (err) {
    logger.error('Error retrieving self task data', err)
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

    let groupTasksSnapshot = []
    let featureTasksSnapshot = []

    if (statuses && statuses.length) {
      groupTasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .where('status', 'in', statuses)
        .get()
      featureTasksSnapshot = await tasksModel.where('assignee', '==', userId)
        .where('status', 'in', statuses)
        .get()
    } else {
      groupTasksSnapshot = await tasksModel.where('participants', 'array-contains', userId)
        .get()

      featureTasksSnapshot = await tasksModel.where('assignee', '==', userId)
        .get()
    }

    const groupTasks = buildTasks(groupTasksSnapshot)
    const tasks = buildTasks(featureTasksSnapshot, groupTasks)

    const promises = tasks.map(async (task) => fromFirestoreData(task))
    const updatedTasks = await Promise.all(promises)
    const taskList = updatedTasks.map(task => {
      task.status = TASK_STATUS[task.status.toUpperCase()]
      return task
    })
    return taskList
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

const fetchUserActiveAndBlockedTasks = async (username) => {
  return await fetchUserTasks(username,
    ['active', 'pending', 'blocked', // old task workflow
      'IN_PROGRESS', 'BLOCKED', 'SMOKE_TESTING'] // new task workflow
  )
}

/**
 * Fetch all the completed tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserCompletedTasks = async (username) => {
  return await fetchUserTasks(username, ['completed', 'COMPLETED'])
}

/**
 * Fetch all overdue tasks
 * @param overdueTasks <Array>: tasks which are overdue
 * @return {Promsie<Array>}
 */
const overdueTasks = async (overDueTasks) => {
  try {
    const newAvailableTasks = await Promise.all(overDueTasks.map(async (task) => {
      let { status, assignee, id } = task
      status = TASK_STATUS.UNASSIGNED
      await tasksModel.doc(id).update({ status, assignee: '' })
      const unassignedTask = await fetchTask(id)
      return {
        unassignedMember: assignee,
        unassignedTask
      }
    }))
    return newAvailableTasks
  } catch (err) {
    logger.error('error updating to new task workflow', err)
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
  fetchActiveTaskMembers,
  fetchSelfTask,
  overdueTasks
}
