const tasks = require('../models/tasks')
/**
 * Creates new task
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Task object
 * @param res {Object} - Express response object
 */
const addNewTask = async (req, res) => {
  try {
    const { id: createdBy } = req.userData
    const body = {
      ...req.body,
      createdBy
    }
    const task = await tasks.updateTask(body)

    return res.json({
      message: 'Task created successfully!',
      task: task.taskDetails,
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
    const allTasks = await tasks.fetchTasks()
    return res.json({
      message: 'Tasks returned successfully!',
      tasks: allTasks.length > 0 ? allTasks : []
    })
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

const getTaskByUser = async (req, res) => {
  try {
    const { username } = req.params

    if (username) {
      const allTasks = await tasks.fetchAllTaskOfUser(username)
      return res.json(allTasks)
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err}`)

    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Fetches all the tasks of the logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfTasks = async (req, res) => {
  try {
    const { username } = req.userData

    if (username) {
      if (req.query.completed) {
        const allCompletedTasks = await tasks.fetchUserCompletedTasks(username)
        return res.json(allCompletedTasks)
      } else {
        const allTasks = await tasks.fetchUserActiveAndBlockedTasks(username)
        return res.json(allTasks)
      }
    }
    return res.boom.notFound('User doesn\'t exist')
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}/**
 * Updates the task
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateTask = async (req, res) => {
  try {
    const task = await tasks.fetchTask(req.params.id)
    if (!task.taskData) {
      return res.boom.notFound('Task not found')
    }

    await tasks.updateTask(req.body, req.params.id)
    return res.status(204).send()
  } catch (err) {
    logger.error(`Error while updating task: ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  addNewTask,
  fetchTasks,
  updateTask,
  getSelfTasks,
  getTaskByUser
}
