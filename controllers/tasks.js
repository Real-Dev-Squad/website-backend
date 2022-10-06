const tasks = require("../models/tasks");
const { TASK_STATUS, TASK_STATUS_OLD } = require("../constants/tasks");
const { addLog } = require("../models/logs");
const { OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING } = TASK_STATUS_OLD;
const { IN_PROGRESS, BLOCKED, SMOKE_TESTING, ASSIGNED } = TASK_STATUS;
/**
 * Creates new task
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Task object
 * @param res {Object} - Express response object
 */
const addNewTask = async (req, res) => {
  try {
    const { id: createdBy } = req.userData;
    const body = {
      ...req.body,
      createdBy,
    };
    const task = await tasks.updateTask(body);

    return res.json({
      message: "Task created successfully!",
      task: task.taskDetails,
      id: task.taskId,
    });
  } catch (err) {
    logger.error(`Error while creating new task: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};
/**
 * Fetches all the tasks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchTasks = async (req, res) => {
  try {
    const allTasks = await tasks.fetchTasks();
    return res.json({
      message: "Tasks returned successfully!",
      tasks: allTasks.length > 0 ? allTasks : [],
    });
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Fetches all the tasks of the requested user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserTasks = async (req, res) => {
  try {
    let { status } = req.query;
    const { username } = req.params;
    let allTasks = [];

    if (status && !Object.keys(TASK_STATUS).includes(status.toUpperCase())) {
      return res.boom.notFound("Status not found!");
    }

    if (status) {
      if (status === OLD_ACTIVE) {
        status = [OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING, IN_PROGRESS, BLOCKED, SMOKE_TESTING];
      } else {
        status = [status];
      }
    }
    allTasks = await tasks.fetchUserTasks(username, status || []);

    if (allTasks.userNotFound) {
      return res.boom.notFound("User doesn't exist");
    }

    return res.json({
      message: "Tasks returned successfully!",
      tasks: allTasks.length > 0 ? allTasks : [],
    });
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err}`);

    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Fetches all the tasks of the logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfTasks = async (req, res) => {
  try {
    const { username } = req.userData;

    if (username) {
      if (req.query.completed) {
        const allCompletedTasks = await tasks.fetchUserCompletedTasks(username);
        return res.json(allCompletedTasks);
      } else {
        const allTasks = await tasks.fetchSelfTasks(username);
        return res.json(allTasks);
      }
    }
    return res.boom.notFound("User doesn't exist");
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};
/**
 * Updates the task
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateTask = async (req, res) => {
  try {
    const task = await tasks.fetchTask(req.params.id);
    if (!task.taskData) {
      return res.boom.notFound("Task not found");
    }

    const newTaskData = req.body;

    const taskLog = {
      type: "task",
      meta: { taskId: req.params.id, username: req.userData.username, userId: req.userData.id },
      body: {
        subType: "change",
        new: {},
      },
    };
    Object.keys(newTaskData).forEach((key) => (taskLog.body.new[`${key}`] = newTaskData[`${key}`]));

    const [, taskLogResult] = await Promise.all([
      tasks.updateTask(newTaskData, req.params.id),
      addLog(taskLog.type, taskLog.meta, taskLog.body),
    ]);
    taskLog.id = taskLogResult.id;

    return res.status(200).json({ message: "Task updated successfully!", taskLog });
  } catch (err) {
    logger.error(`Error while updating task: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Updates self task status
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { dev } = req.query;
    const { id: userId } = req.userData;
    const task = await tasks.fetchSelfTask(taskId, userId);

    if (task.taskNotFound) return res.boom.notFound("Task doesn't exist");
    if (task.notAssignedToYou) return res.boom.forbidden("This task is not assigned to you");
    if (task.taskData.status === "VERIFIED")
      return res.boom.forbidden("Status cannot be updated. Please contact admin.");

    await tasks.updateTask(req.body, taskId);

    if (dev) {
      if (req.body.percentCompleted === 100) {
        return next();
      }
    }

    return res.json({ message: "Task updated successfully!" });
  } catch (err) {
    logger.error(`Error while updating task status : ${err}`);
    return res.boom.badImplementation("An internal server error occured");
  }
};

/**
 * Fetches all the overdue tasks
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const overdueTasks = async (req, res) => {
  try {
    const allTasks = await tasks.fetchTasks();
    const now = Math.floor(Date.now() / 1000);
    const overDueTasks = allTasks.filter(
      (task) => (task.status === ASSIGNED || task.status === IN_PROGRESS) && task.endsOn < now
    );
    const newAvailableTasks = await tasks.overdueTasks(overDueTasks);
    return res.json({
      message: newAvailableTasks.length ? "Overdue Tasks returned successfully!" : "No overdue tasks found",
      newAvailableTasks,
    });
  } catch (err) {
    logger.error(`Error while fetching overdue tasks : ${err}`);
    return res.boom.badImplementation("An internal server error occured");
  }
};

module.exports = {
  addNewTask,
  fetchTasks,
  updateTask,
  getSelfTasks,
  getUserTasks,
  updateTaskStatus,
  overdueTasks,
};
