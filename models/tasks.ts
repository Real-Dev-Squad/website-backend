// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userUtils'... Remove this comment to see the full error message
const userUtils = require('../utils/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fromFirest... Remove this comment to see the full error message
const { fromFirestoreData, toFirestoreData, buildTasks } = require('../utils/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TASK_TYPE'... Remove this comment to see the full error message
const { TASK_TYPE, TASK_STATUS } = require('../constants/tasks')

/**
 * Adds and Updates tasks
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @param taskId { string }: taskid which will be used to update the task in DB
 * @return {Promise<{taskId: string}>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'updateTask... Remove this comment to see the full error message
const updateTask = async (taskData: any, taskId = null) => {
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchTasks... Remove this comment to see the full error message
const fetchTasks = async () => {
  try {
    const tasksSnapshot = await tasksModel.get()
    const tasks = buildTasks(tasksSnapshot)
    const promises = tasks.map(async (task: any) => fromFirestoreData(task))
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
      tasksSnapshot.forEach((task: any) => {
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
const fetchTask = async (taskId: any) => {
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
 * Fetch assigned self task
 * @param taskId { string }: taskId which will be used to fetch the task
 * @param id { string }: id to check task is assigned to self or not
 * @return {Promsie<taskData|Object>}
 */
const fetchSelfTask = async (taskId: any, userId: any) => {
  try {
    const task = await tasksModel.doc(taskId).get()
    const taskData = task.data()
    if (!taskData) return { taskNotFound: true }
    if (userId !== taskData.assignee) return { notAssignedToYou: true }
    return { taskData: await fromFirestoreData(taskData) }
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

const fetchUserTasks = async (username: any, statuses = []) => {
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

    const promises = tasks.map(async (task: any) => fromFirestoreData(task))
    const updatedTasks = await Promise.all(promises)
    return updatedTasks
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

const fetchUserActiveAndBlockedTasks = async (username: any) => {
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
  return await fetchUserTasks(username, ['active', 'pending', 'blocked'])
}

/**
 * Fetch all the completed tasks of a user
 *
 * @return {Promise<tasks|Array>}
 */

const fetchUserCompletedTasks = async (username: any) => {
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
  return await fetchUserTasks(username, ['completed'])
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  updateTask,
  fetchTasks,
  fetchTask,
  fetchUserTasks,
  fetchUserActiveAndBlockedTasks,
  fetchUserCompletedTasks,
  fetchActiveTaskMembers,
  fetchSelfTask
}
