const taskQuery = require('../models/tasks')

const addNewTask = async (req, res) => {
  try {
    const task = await taskQuery.addTask(req.body)
    return res.json({
      message: 'Task created successfully!',
      task: req.body,
      id: task.taskid
    })
  } catch (err) {
    logger.error(`Error while creating new task: ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

const fetchTasks = async (req, res) => {
  try {
    const allTasks = await taskQuery.fetchTasks()
    if (allTasks.length > 0) {
      return res.status(200).json({
        message: 'Tasks returned successfully!',
        tasks: allTasks
      })
    } else {
      return res.boom.notFound('No tasks found')
    }
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  addNewTask,
  fetchTasks
}
