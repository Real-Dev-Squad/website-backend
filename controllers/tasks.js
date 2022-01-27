const tasks = require('../models/tasks')
const { TASK_STATUS } = require('../constants/tasks')
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

/**
 * Fetches all the tasks of the requested user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserTasks = async (req, res) => {
  try {
    const { status } = req.query
    const { username } = req.params
    let allTasks = []

    if (status && !Object.keys(TASK_STATUS).includes(status.toUpperCase())) {
      return res.boom.notFound('Status not found!')
    }

    allTasks = await tasks.fetchUserTasks(username, status ? [status] : [])

    if (allTasks.userNotFound) {
      return res.boom.notFound('User doesn\'t exist')
    }

    return res.json({
      message: 'Tasks returned successfully!',
      tasks: allTasks.length > 0 ? allTasks : []
    })
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

/**
 * Updates self task status
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id
    const { id: userId } = req.userData
    const task = await tasks.fetchSelfTask(taskId, userId)

    if (task.taskNotFound) return res.boom.notFound('Task doesn\'t exist')
    if (task.notAssignedToYou) return res.boom.forbidden('This task is not assigned to you')

    await tasks.updateTask(req.body, taskId)
    return res.json({ message: 'Task updated successfully!' })
  } catch (err) {
    logger.error(`Error while updating task status : ${err}`)
    return res.boom.badImplementation('An internal server error occured')
  }
}

/**
 * Fetches all the overdue tasks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const overdueTasks = async (req, res) => {
  try {
    const allTasks = await tasks.fetchTasks()
    const now = Math.floor(Date.now() / 1000)
    const overDueTasks = allTasks.filter(task => (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && task.endsOn < now)
    const newAvailableTasks = await tasks.overdueTasks(overDueTasks)
    return res.json({
      newAvailableTasks
    })
  } catch (err) {
    logger.error(`Error while setting new task workflow : ${err}`)
    return res.boom.badImplementation('An internal server error occured')
  }
}

module.exports = {
  addNewTask,
  fetchTasks,
  updateTask,
  getSelfTasks,
  getUserTasks,
  updateTaskStatus,
  overdueTasks
}
