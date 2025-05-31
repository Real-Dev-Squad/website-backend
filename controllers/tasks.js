const tasks = require("../models/tasks");
const { TASK_STATUS, TASK_STATUS_OLD, tasksUsersStatus } = require("../constants/tasks");
const { addLog } = require("../models/logs");
const { USER_STATUS } = require("../constants/users");
const { addOrUpdate, getRdsUserInfoByGitHubUsername } = require("../models/users");
const { OLD_ACTIVE, OLD_BLOCKED, OLD_PENDING } = TASK_STATUS_OLD;
const { IN_PROGRESS, BLOCKED, SMOKE_TESTING, ASSIGNED } = TASK_STATUS;
const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const dependencyModel = require("../models/tasks");
const { transformQuery, transformTasksUsersQuery } = require("../utils/tasks");
const { getPaginatedLink } = require("../utils/helper");
const { updateUserStatusOnTaskUpdate, updateStatusOnTaskCompletion } = require("../models/userStatus");
const dataAccess = require("../services/dataAccessLayer");
const { parseSearchQuery } = require("../utils/tasks");
const { addTaskCreatedAtAndUpdatedAtFields } = require("../services/tasks");
const tasksService = require("../services/tasks");
const { RQLQueryParser } = require("../utils/RQLParser");
const { getMissedProgressUpdatesUsers } = require("../models/discordactions");
const { logType } = require("../constants/logs");

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
    let userStatusUpdate;
    const timeStamp = Math.round(Date.now() / 1000);
    const body = {
      ...req.body,
      createdBy,
      createdAt: timeStamp,
      updatedAt: timeStamp,
    };
    delete body.dependsOn;
    const { taskId, taskDetails } = await tasks.updateTask(body);
    const data = {
      taskId,
      dependsOn,
    };
    const taskDependency = dependsOn && (await dependencyModel.addDependency(data));
    if (req.body.assignee) {
      userStatusUpdate = await updateUserStatusOnTaskUpdate(req.body.assignee);
    }
    return res.json({
      message: "Task created successfully!",
      task: {
        ...taskDetails,
        ...(taskDependency && { dependsOn: taskDependency }),
        id: taskId,
      },
      ...(userStatusUpdate && { userStatus: userStatusUpdate }),
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

const fetchTasksWithRdsAssigneeInfo = async (allTasks) => {
  const tasksWithRdsAssigneeInfo = allTasks.map(async (task) => {
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
  const tasks = await Promise.all(tasksWithRdsAssigneeInfo);
  return tasks;
};

const fetchPaginatedTasks = async (query) => {
  try {
    const tasksData = await tasks.fetchPaginatedTasks(query);
    const { allTasks, next, prev } = tasksData;
    const tasksWithRdsAssigneeInfo = await fetchTasksWithRdsAssigneeInfo(allTasks);

    const result = {
      tasks: tasksWithRdsAssigneeInfo.length > 0 ? tasksWithRdsAssigneeInfo : [],
      prev,
      next,
    };

    if (next) {
      const nextLink = getPaginatedLink({
        endpoint: "/tasks",
        query,
        cursorKey: "next",
        docId: next,
      });
      result.next = nextLink;
    }

    if (prev) {
      const prevLink = getPaginatedLink({
        endpoint: "/tasks",
        query,
        cursorKey: "prev",
        docId: prev,
      });
      result.prev = prevLink;
    }

    return result;
  } catch (err) {
    logger.error(`Error while fetching paginated tasks ${err}`);
    return err;
  }
};

const fetchTasks = async (req, res) => {
  try {
    const {
      status,
      page,
      size,
      prev,
      next,
      q: queryString,
      assignee,
      title,
      userFeatureFlag,
      orphaned,
      dev,
    } = req.query;
    const transformedQuery = transformQuery(status, size, page, assignee, title);

    if (queryString !== undefined) {
      const searchParams = parseSearchQuery(queryString);
      if (!searchParams.searchTerm) {
        return res.status(404).json({
          message: "No tasks found.",
          tasks: [],
        });
      }
      const filterTasks = await tasks.fetchTasks(searchParams.searchTerm);
      const tasksWithRdsAssigneeInfo = await fetchTasksWithRdsAssigneeInfo(filterTasks);
      if (tasksWithRdsAssigneeInfo.length === 0) {
        return res.status(404).json({
          message: "No tasks found.",
          tasks: [],
        });
      }
      return res.json({
        message: "Filter tasks returned successfully!",
        tasks: tasksWithRdsAssigneeInfo,
      });
    }

    const isOrphaned = orphaned === "true";
    const isDev = dev === "true";
    if (isOrphaned) {
      if (!isDev) {
        return res.boom.notFound("Route not found");
      }
      try {
        const orphanedTasks = await tasksService.fetchOrphanedTasks();
        if (!orphanedTasks || orphanedTasks.length === 0) {
          return res.sendStatus(204);
        }
        const tasksWithRdsAssigneeInfo = await fetchTasksWithRdsAssigneeInfo(orphanedTasks);
        return res.status(200).json({
          message: "Orphan tasks fetched successfully",
          data: tasksWithRdsAssigneeInfo,
        });
      } catch (error) {
        logger.error("Error in getting tasks which were orphaned", error);
        return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
      }
    }

    const paginatedTasks = await fetchPaginatedTasks({ ...transformedQuery, prev, next, userFeatureFlag });
    return res.json({
      message: "Tasks returned successfully!",
      ...paginatedTasks,
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

/**
 * @deprecated
 * WARNING: This API endpoint is being deprecated and will be removed in future versions.
 * Please use the updated API endpoint: `/tasks/:username` for retrieving user's task details.
 *
 * This API is kept temporarily for backward compatibility.
 */

const getSelfTasks = async (req, res) => {
  try {
    const { username } = req.userData;

    if (!username) {
      return res.boom.notFound("User doesn't exist");
    }

    const tasksData = req.query.completed
      ? await tasks.fetchUserCompletedTasks(username)
      : await tasks.fetchSelfTasks(username);

    res.set(
      "X-Deprecation-Warning",
      "WARNING: This endpoint is deprecated and will be removed in the future. Please use /tasks/:username to get the task details."
    );
    return res.json(tasksData);
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
      taskData: { ...taskData, dependsOn: dependencyDocReference },
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
    const requestData = { ...req.body, updatedAt: Math.round(Date.now() / 1000) };
    if (requestData?.assignee) {
      const user = await dataAccess.retrieveUsers({ username: requestData.assignee });
      if (!user.userExists) {
        return res.boom.notFound("User doesn't exist");
      }
      if (!requestData?.startedOn) {
        requestData.startedOn = Math.round(new Date().getTime() / 1000);
      }
    }

    await tasks.updateTask(requestData, req.params.id);
    if (requestData.assignee) {
      // New Assignee Status Update
      await updateUserStatusOnTaskUpdate(requestData.assignee);
      // Old Assignee Status Update if available
      if (task.taskData.assigneeId) {
        await updateStatusOnTaskCompletion(task.taskData.assigneeId);
      }
    }

    return res.status(204).send();
  } catch (err) {
    if (err.message.includes("Invalid dependency passed")) {
      const errorMessage = "Invalid dependency";
      logger.error(`Error while updating task: ${errorMessage}`);
      return res.boom.badRequest(errorMessage);
    }
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
    req.body.updatedAt = Math.round(new Date().getTime() / 1000);
    let userStatusUpdate;
    const taskId = req.params.id;
    const { userStatusFlag } = req.query;
    const status = req.body?.status;
    const { id: userId, username } = req.userData;
    const task = await tasks.fetchSelfTask(taskId, userId);

    if (task.taskNotFound) return res.boom.notFound("Task doesn't exist");
    if (task.notAssignedToYou) return res.boom.forbidden("This task is not assigned to you");
    if (TASK_STATUS.BACKLOG === status) {
      return res.boom.forbidden("Status cannot be updated. Please contact admin.");
    }
    if (userStatusFlag) {
      if (task.taskData.status === TASK_STATUS.DONE) {
        return res.boom.forbidden("Status cannot be updated. Please contact admin.");
      }
      if (status) {
        const isCurrentTaskStatusInProgress = task.taskData.status === TASK_STATUS.IN_PROGRESS;
        const isCurrentTaskStatusBlock = task.taskData.status === TASK_STATUS.BLOCKED;
        const isNewTaskStatusInProgress = status === TASK_STATUS.IN_PROGRESS;
        const isNewTaskStatusBlock = status === TASK_STATUS.BLOCKED;
        const isCurrProgress100 = parseInt(task.taskData.percentCompleted || 0) === 100;
        const isCurrProgress0 = parseInt(task.taskData.percentCompleted || 0) === 0;
        const isNewProgress100 = !!req.body.percentCompleted && parseInt(req.body.percentCompleted) === 100;
        const percentCompleted = req.body.percentCompleted;
        const isNewProgress0 = percentCompleted !== undefined && parseInt(percentCompleted) === 0;

        if (
          !isCurrProgress100 &&
          !isNewProgress100 &&
          (isCurrentTaskStatusBlock || isCurrentTaskStatusInProgress) &&
          !isNewTaskStatusBlock &&
          !isNewTaskStatusInProgress
        ) {
          return res.boom.badRequest(
            `The status of task can not be changed from ${
              isCurrentTaskStatusInProgress ? "In progress" : "Blocked"
            } until progress of task is not 100%.`
          );
        }
        if (isNewTaskStatusInProgress && !isCurrentTaskStatusBlock && !isCurrProgress0 && !isNewProgress0) {
          return res.boom.badRequest(
            "The status of task can not be changed to In progress until progress of task is not 0%."
          );
        }
      }
    } else {
      if (task.taskData.status === TASK_STATUS.VERIFIED || TASK_STATUS.MERGED === status) {
        return res.boom.forbidden("Status cannot be updated. Please contact admin.");
      }
      if (task.taskData.status === TASK_STATUS.COMPLETED && req.body.percentCompleted < 100) {
        if (status === TASK_STATUS.COMPLETED || !status) {
          return res.boom.badRequest("Task percentCompleted can't updated as status is COMPLETED");
        }
      }
      if (
        (status === TASK_STATUS.COMPLETED || status === TASK_STATUS.VERIFIED) &&
        task.taskData.percentCompleted !== 100
      ) {
        if (req.body.percentCompleted !== 100) {
          return res.boom.badRequest("Status cannot be updated as progress of task is not 100%.");
        }
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

    if (status && !req.body.percentCompleted) {
      taskLog.body.new.status = status;
    }
    if (req.body.percentCompleted && !status) {
      taskLog.body.new.percentCompleted = req.body.percentCompleted;
    }

    if (req.body.percentCompleted && status) {
      taskLog.body.new.percentCompleted = req.body.percentCompleted;
      taskLog.body.new.status = status;
    }

    const [, taskLogResult] = await Promise.all([
      tasks.updateTask(req.body, taskId),
      addLog(taskLog.type, taskLog.meta, taskLog.body),
    ]);
    taskLog.id = taskLogResult.id;

    if (status) {
      userStatusUpdate = await updateStatusOnTaskCompletion(userId);
    }
    return res.json({
      message: "Task updated successfully!",
      taskLog,
      ...(userStatusUpdate && { userStatus: userStatusUpdate }),
    });
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

const updateStatus = async (req, res) => {
  try {
    const { action, field } = req.body;
    if (action === "ADD" && field === "CREATED_AT+UPDATED_AT") {
      const updateStats = await addTaskCreatedAtAndUpdatedAtFields();
      return res.json(updateStats);
    }
    const response = await tasks.updateTaskStatus();
    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error in migration scripts", error);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const orphanTasks = async (req, res) => {
  try {
    const updatedTasksData = await tasks.updateOrphanTasksStatus();

    return res.status(200).json({ message: "Orphan tasks filtered successfully", updatedTasksData });
  } catch (error) {
    logger.error("Error in filtering orphan tasks", error);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getUsersHandler = async (req, res) => {
  try {
    const { size, cursor, q: queryString } = req.query;
    const rqlParser = new RQLQueryParser(queryString);
    const filterQueries = rqlParser.getFilterQueries();
    const {
      dateGap,
      weekdayList,
      dateList,
      status,
      size: transformedSize,
    } = transformTasksUsersQuery({ ...filterQueries, size });
    if (status === tasksUsersStatus.MISSED_UPDATES) {
      const response = await getMissedProgressUpdatesUsers({
        cursor: cursor,
        size: transformedSize,
        excludedDates: dateList,
        excludedDays: weekdayList,
        dateGap: dateGap,
      });

      if (response.error) {
        return res.boom.badRequest(response.message);
      }
      return res
        .status(200)
        .json({ message: "Discord details of users with status missed updates fetched successfully", data: response });
    } else {
      return res.boom.badRequest(`Invalid status: ${status}`);
    }
  } catch (error) {
    const taskRequestLog = {
      type: logType.TASKS_MISSED_UPDATES_ERRORS,
      meta: {
        lastModifiedAt: Date.now(),
      },
      body: {
        request: req.query,
        error: error.toString(),
      },
    };
    await addLog(taskRequestLog.type, taskRequestLog.meta, taskRequestLog.body);
    logger.error("Error in fetching users details of tasks", error);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
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
  updateStatus,
  getUsersHandler,
  orphanTasks,
};
