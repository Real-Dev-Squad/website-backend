const taskQuery = require('../models/tasks')
/**
 * Creates new task
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Task object
 * @param res {Object} - Express response object
 */
const addNewTask = async (req, res) => {
  try {
    const task = await taskQuery.addTask(req.body)
    return res.json({
      message: 'Task created successfully!',
      task: req.body,
      id: task.taskId
    })
  } catch (err) {
    logger.error(`Error while creating new task: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}
/**
 * Fetches all the tasks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchTasks = async (req, res) => {
  try {
    const allTasks = await taskQuery.fetchTasks()
    if (allTasks.length > 0) {
      return res.status(200).json({
        message: 'Tasks returned successfully!',
        tasks: allTasks
      })
    }
    return res.boom.notFound('No tasks found')
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  addNewTask,
  fetchTasks
}
