const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const { TASK_REQUEST_TYPE } = require("../constants/taskRequests");
const taskRequestsModel = require("../models/taskRequests");
const tasksModel = require("../models/tasks.js");
const githubService = require("../services/githubService");
const usersUtils = require("../utils/users");

const fetchTaskRequests = async (_, res) => {
  try {
    const { dev } = _.query;
    const data = await taskRequestsModel.fetchTaskRequests(dev === "true");

    if (data.length > 0) {
      return res.status(200).json({
        message: "Task requests returned successfully",
        data,
      });
    }

    return res.status(404).json({
      message: "Task requests not found",
      data,
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
    switch (req.body.requestType) {
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

    return res.status(200).json({
      message: `Task successfully assigned to user ${response.approvedTo}`,
      taskRequest: response.taskRequest,
    });
  } catch (err) {
    logger.error("Error while approving task request", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  approveTaskRequest,
  addOrUpdate,
  fetchTaskRequests,
  fetchTaskRequestById,
  addTaskRequests,
};
