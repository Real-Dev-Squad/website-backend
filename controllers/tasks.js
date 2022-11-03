const tasks = require("../models/tasks");
const { TASK_STATUS, TASK_STATUS_OLD } = require("../constants/tasks");
const { USER_STATUS } = require("../constants/users");
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

const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { taskData } = await tasks.fetchTask(taskId);

    if (!taskData) {
      return res.boom.notFound("Task not found");
    }
    return res.json({ message: "task returned successfully", taskData });
  } catch (err) {
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

    await tasks.updateTask(req.body, req.params.id);
    return res.status(204).send();
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

const assignTask = async (req, res) => {
  // we will fetch the skilltag leveltag of that particular user here once we have the skill with his userId
  // we can check here the all the level, and whichever is the smallest we can make the request with that particular category, for now value is hardcoded
  // I am putting the names of the skills but we are going to get id
  try {
    const { status, username } = req.userData;

    if (status !== USER_STATUS.IDLE) {
      return res.json({ message: "Task cannot be assigned to users with active or OOO status" });
    }

    const { task } = await tasks.fetchSkillLevelTask("FRONTEND", 1);
    if (!task) return res.json({ message: "Task not found" });

    await tasks.updateTask({ assignee: username, status: TASK_STATUS.ASSIGNED }, task.id);
    return res.json({ message: "Task assigned" });
  } catch {
    return res.boom.badImplementation("Something went wrong!");
  }
};

module.exports = {
  addNewTask,
  fetchTasks,
  updateTask,
  getSelfTasks,
  getUserTasks,
  getTask,
  updateTaskStatus,
  overdueTasks,
  assignTask,
};
