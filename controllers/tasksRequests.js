const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const { TASK_REQUEST_TYPE, MIGRATION_TYPE } = require("../constants/taskRequests");
const { addLog } = require("../models/logs");
const taskRequestsModel = require("../models/taskRequests");
const tasksModel = require("../models/tasks.js");
const { updateUserStatusOnTaskUpdate } = require("../models/userStatus");
const githubService = require("../services/githubService");
const usersUtils = require("../utils/users");

const fetchTaskRequests = async (_, res) => {
  try {
    const { dev } = _.query;
    let data;
    if (dev === "true") {
      data = await taskRequestsModel.fetchPaginatedTaskRequests(_.query);
      if (data.error) {
        return res.status(data.statusCode).json(data);
      }
    } else {
      data = {};
      data.data = await taskRequestsModel.fetchTaskRequests(true);
    }

    return res.status(200).json({
      message: "Task requests returned successfully",
      ...data,
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const fetchTaskRequestById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await taskRequestsModel.fetchTaskRequestById(id);

    if (!data.taskRequestExists) {
      return res.status(404).json({
        message: "Task request not found",
      });
    }
    return res.status(200).json({
      message: "Task request returned successfully",
      data: data.taskRequestData,
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addTaskRequests = async (req, res) => {
  try {
    const taskRequestData = req.body;
    const usernamePromise = usersUtils.getUsername(taskRequestData.userId);
    if (req.userData.id !== taskRequestData.userId && !req.userData.roles?.super_user) {
      return res.boom.forbidden("Not authorized to create the request");
    }
    if (taskRequestData.proposedDeadline < taskRequestData.proposedStartDate) {
      return res.boom.badRequest("Task deadline cannot be before the start date");
    }
    switch (taskRequestData.requestType) {
      case TASK_REQUEST_TYPE.ASSIGNMENT: {
        const taskDataPromise = tasksModel.fetchTask(taskRequestData.taskId);

        const [{ taskData }, username] = await Promise.all([taskDataPromise, usernamePromise]);
        taskRequestData.taskTitle = taskData?.title;
        if (!username) {
          return res.boom.badRequest("User not found");
        }
        if (!taskData) {
          return res.boom.badRequest("Task does not exist");
        }
        break;
      }
      case TASK_REQUEST_TYPE.CREATION: {
        let issuePromise;
        try {
          const url = new URL(taskRequestData.externalIssueUrl);
          const issueUrlPaths = url.pathname.split("/");
          const repositoryName = issueUrlPaths[3];
          const issueNumber = issueUrlPaths[5];
          issuePromise = githubService.fetchIssuesById(repositoryName, issueNumber);
        } catch (error) {
          return res.boom.badRequest("External issue url is not valid");
        }
        const [issueData, username] = await Promise.all([issuePromise, usernamePromise]);
        taskRequestData.taskTitle = issueData?.title;
        if (!username) {
          return res.boom.badRequest("User not found");
        }
        if (!issueData) {
          return res.boom.badRequest("Issue does not exist");
        }
        break;
      }
    }
    const newTaskRequest = await taskRequestsModel.createRequest(taskRequestData, req.userData.username);

    if (newTaskRequest.isCreationRequestApproved) {
      return res.boom.conflict("Task exists for the given issue.");
    }
    if (newTaskRequest.alreadyRequesting) {
      return res.boom.badRequest("Task was already requested");
    }

    const taskRequestLog = {
      type: "taskRequests",
      meta: {
        taskRequestId: newTaskRequest.id,
        action: "create",
        createdBy: req.userData.username,
        createdAt: Date.now(),
        lastModifiedBy: req.userData.username,
        lastModifiedAt: Date.now(),
      },
      body: newTaskRequest.taskRequest,
    };
    await addLog(taskRequestLog.type, taskRequestLog.meta, taskRequestLog.body);

    const statusCode = newTaskRequest.isCreate ? 201 : 200;
    return res.status(statusCode).json({
      message: "Task request successful.",
      data: {
        id: newTaskRequest.id,
        ...newTaskRequest.taskRequest,
      },
    });
  } catch (err) {
    logger.error("Error while creating task request");
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const addOrUpdate = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    if (!taskId) {
      return res.boom.badRequest("taskId not provided");
    }

    const { taskData } = await tasksModel.fetchTask(taskId);
    if (!taskData) {
      return res.boom.conflict("Task does not exist");
    }

    const response = await taskRequestsModel.addOrUpdate(taskId, userId);

    if (response.alreadyRequesting) {
      return res.boom.conflict("User is already requesting for the task");
    }

    if (response.isCreate) {
      return res.status(201).json({
        message: "Task request successfully created",
        taskRequest: response.taskRequest,
      });
    }

    return res.status(200).json({
      message: "Task request successfully updated",
      requestors: response.requestors,
    });
  } catch (err) {
    logger.error("Error while creating task request");
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId, user } = req.body;
    if (!taskRequestId) {
      return res.boom.badRequest("taskRequestId not provided");
    }

    const response = await taskRequestsModel.approveTaskRequest(taskRequestId, user);

    if (response.taskRequestNotFound) {
      return res.boom.badRequest("Task request not found.");
    }
    if (response.isUserInvalid) {
      return res.boom.badRequest("User request not available.");
    }
    if (response.isTaskRequestInvalid) {
      return res.boom.badRequest("Task request was previously approved or rejected.");
    }

    await updateUserStatusOnTaskUpdate(user.username);

    const taskRequestLog = {
      type: "taskRequests",
      meta: {
        taskRequestId: taskRequestId,
        action: "update",
        subAction: "approve",
        createdBy: req.userData.username,
        createdAt: Date.now(),
        lastModifiedBy: req.userData.username,
        lastModifiedAt: Date.now(),
      },
      body: response.taskRequest,
    };
    await addLog(taskRequestLog.type, taskRequestLog.meta, taskRequestLog.body);

    return res.status(200).json({
      message: `Task successfully assigned to user ${response.approvedTo}`,
      taskRequest: response.taskRequest,
    });
  } catch (err) {
    logger.error("Error while approving task request", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const migrateTaskRequests = async (req, res) => {
  try {
    const { action } = req.query;
    let responseData;
    switch (action) {
      case MIGRATION_TYPE.ADD_NEW_FIELDS: {
        responseData = await taskRequestsModel.addNewFields();
        break;
      }
      case MIGRATION_TYPE.REMOVE_OLD_FIELDS: {
        responseData = await taskRequestsModel.removeOldField();
        break;
      }
      default: {
        return res.boom.badRequest("Unknown action");
      }
    }
    return res.json({ message: "Task requests migration successful", ...responseData });
  } catch (err) {
    logger.error("Error in migration scripts", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
module.exports = {
  approveTaskRequest,
  addOrUpdate,
  fetchTaskRequests,
  fetchTaskRequestById,
  addTaskRequests,
  migrateTaskRequests,
};
