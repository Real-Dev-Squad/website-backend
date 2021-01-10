const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')

/**
 * Adds new task
 *
 * @param taskData { Object }: task data object to be stored in DB
 * @return {Promise<{taskId: string}>}
 */
const addTask = async (taskData) => {
  try {
    const taskInfo = await tasksModel.add(taskData)
    return { taskId: taskInfo.id }
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

module.exports = {
  addTask,
  fetchTasks
}
