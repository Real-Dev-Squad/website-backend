const tasks = require('../models/tasks')
const userMapping = require('../utils/users')
/**
 * Converts the userIds entered in the array to corresponding usernames
 * @param participantArray {array} : participants array to be updated
 * @returns participantUsernames {array} : array of usernames of all participants
 */
const getParticipantUsernames = async (participantArray) => {
  try {
    const promises = participantArray.map(async (participant) => {
      const participantUsername = await userMapping.toUsername(participant.trim())
      return participantUsername
    })
    const participantUsernames = await Promise.all(promises)
    return participantUsernames
  } catch (err) {
    logger.error('Error in updating the task object', err)
    throw err
  }
}
/**
 * Converts the usernames entered in the database to corresponding usernames
 * @param participantArray {array} : participants array to be updated
 * @returns participantUserIds {array} : array of user ids of all participants
 */
const getParticipantUserIds = async (participantArray) => {
  try {
    const promises = participantArray.map(async (participant) => {
      const participantUserId = await userMapping.toUserId(participant.trim())
      return participantUserId
    })
    const participantUserIds = await Promise.all(promises)
    return participantUserIds
  } catch (err) {
    logger.error('Error in updating the task object', err)
    throw err
  }
}
/**
 * Creates new task
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Task object
 * @param res {Object} - Express response object
 */
const addNewTask = async (req, res) => {
  try {
    const tasksArray = req.body
    const participants = await getParticipantUserIds(tasksArray.participants)
    const ownerId = await userMapping.toUserId(tasksArray.ownerId)
    const taskDetails = ({
      ...tasksArray,
      participants,
      ownerId
    })
    const task = await tasks.updateTask(taskDetails)
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
    const allTasks = await tasks.fetchTasks(req.body)
    const promises = allTasks.map(async (task) => {
      const participants = await getParticipantUsernames(task.participants)
      const ownerId = await userMapping.toUsername(task.ownerId)
      return { ...task, ownerId, participants }
    })
    const updatedTasks = await Promise.all(promises)
    return res.json({
      message: 'Tasks returned successfully!',
      tasks: updatedTasks.length > 0 ? updatedTasks : []
    })
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`)
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
  getSelfTasks
}
