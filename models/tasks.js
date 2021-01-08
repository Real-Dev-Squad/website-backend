const firestore = require('../utils/firestore')
const tasksModel = firestore.collection('tasks')

const addTask = async (taskData) => {
  try {
    const taskInfo = await tasksModel.add(taskData)
    return { taskid: taskInfo.id }
  } catch (err) {
    logger.error('Error in creating task', err)
    throw err
  }
}

async function fetchTasks () {
  try {
    const tasksSnapshot = await tasksModel.get()
    return (function () {
      const tasks = []
      tasksSnapshot.forEach((task) => {
        tasks.push({
          id: task.id,
          ...task.data()
        })
      })
      return tasks
    })()
  } catch (err) {
    logger.error('error getting tasks', err)
    throw err
  }
}

module.exports = {
  addTask,
  fetchTasks
}
