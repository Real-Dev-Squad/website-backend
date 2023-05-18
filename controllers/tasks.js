const tasks = require("../models/tasks");
const { TASK_STATUS, TASK_STATUS_OLD } = require("../constants/tasks");
const { addLog } = require("../models/logs");
const { USER_STATUS } = require("../constants/users");
const { addOrUpdate, getRdsUserInfoByGitHubUsername } = require("../models/users");
const { OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING } = TASK_STATUS_OLD;
const { IN_PROGRESS, BLOCKED, SMOKE_TESTING, ASSIGNED } = TASK_STATUS;
const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const dependencyModel = require("../models/tasks");
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
    const dependsOn = req.body.dependsOn;
    const body = {
      ...req.body,
      createdBy,
    };
    delete body.dependsOn;
    const { taskId, taskDetails } = await tasks.updateTask(body);
    const data = {
      taskId,
      dependsOn,
    };
    const taskDependency = dependsOn && (await dependencyModel.addDependency(data));
    return res.json({
      message: "Task created successfully!",
      task: {
        ...taskDetails,
        ...(taskDependency && { dependsOn: taskDependency }),
        id: taskId,
      },
    });
  } catch (err) {
    logger.error(`Error while creating new task: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    const fetchTasksWithRdsAssigneeInfo = allTasks.map(async (task) => {
      /*
       If the issue has a "github.issue" inner object and a property "assignee",
       then fetch the RDS user information with GitHub username in "assignee"
      */
      if (Object.keys(task).includes("github")) {
        if (Object.keys(task.github.issue).includes("assignee")) {
          return {
            ...task,
            github: {
              ...task.github,
              issue: {
                ...task.github.issue,
                assigneeRdsInfo: await getRdsUserInfoByGitHubUsername(task.github.issue.assignee),
              },
            },
          };
        }
      }
      return task;
    });

    const tasksWithRdsAssigneeInfo = await Promise.all(fetchTasksWithRdsAssigneeInfo);
    return res.json({
      message: "Tasks returned successfully!",
      tasks: tasksWithRdsAssigneeInfo.length > 0 ? tasksWithRdsAssigneeInfo : [],
    });
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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

    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { taskData, dependencyDocReference } = await tasks.fetchTask(taskId);
    if (!taskData) {
      return res.boom.notFound("Task not found");
    }
    return res.json({
      message: "task returned successfully",
      task: { ...taskData, dependsOn: dependencyDocReference },
    });
  } catch (err) {
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    const { id: userId, username } = req.userData;
    const task = await tasks.fetchSelfTask(taskId, userId);

    if (task.taskNotFound) return res.boom.notFound("Task doesn't exist");
    if (task.notAssignedToYou) return res.boom.forbidden("This task is not assigned to you");
    if (task.taskData.status === TASK_STATUS.VERIFIED || req.body.status === TASK_STATUS.MERGED)
      return res.boom.forbidden("Status cannot be updated. Please contact admin.");

    if (task.taskData.status === TASK_STATUS.COMPLETED && req.body.percentCompleted < 100) {
      if (req.body.status === TASK_STATUS.COMPLETED || !req.body.status) {
        return res.boom.badRequest("Task percentCompleted can't updated as status is COMPLETED");
      }
    }

    if (req.body.status === TASK_STATUS.COMPLETED && task.taskData.percentCompleted !== 100) {
      if (req.body.percentCompleted !== 100) {
        return res.boom.badRequest("Status cannot be updated. Task is not completed yet");
      }
    }

    const taskLog = {
      type: "task",
      meta: {
        userId,
        taskId,
        username,
      },
      body: {
        subType: "update",
        new: {},
      },
    };

    if (req.body.status && !req.body.percentCompleted) {
      taskLog.body.new.status = req.body.status;
    }
    if (req.body.percentCompleted && !req.body.status) {
      taskLog.body.new.percentCompleted = req.body.percentCompleted;
    }

    if (req.body.percentCompleted && req.body.status) {
      taskLog.body.new.percentCompleted = req.body.percentCompleted;
      taskLog.body.new.status = req.body.status;
    }

    const [, taskLogResult] = await Promise.all([
      tasks.updateTask(req.body, taskId),
      addLog(taskLog.type, taskLog.meta, taskLog.body),
    ]);
    taskLog.id = taskLogResult.id;

    if (dev) {
      if (req.body.percentCompleted === 100) {
        return next();
      }
    }

    return res.json({ message: "Task updated successfully!", taskLog });
  } catch (err) {
    logger.error(`Error while updating task status : ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const assignTask = async (req, res) => {
  try {
    const { status, username, id: userId } = req.userData;

    if (status !== USER_STATUS.IDLE) {
      return res.json({ message: "Task cannot be assigned to users with active or OOO status" });
    }

    const { task } = await tasks.fetchSkillLevelTask(userId);
    if (!task) return res.json({ message: "Task not found" });

    const { taskId } = await tasks.updateTask({ assignee: username, status: TASK_STATUS.ASSIGNED }, task.itemId);
    if (taskId) {
      // this will change once we start storing status in different collection
      await addOrUpdate({ status: "active" }, userId);
    }
    return res.json({ message: "Task assigned", Id: task.itemId });
  } catch {
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
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
