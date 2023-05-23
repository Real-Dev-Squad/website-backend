const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const taskRequestsModel = require("../models/taskRequests");
const userModel = require("../models/users.js");
const userStatusModel = require("../models/userStatus.js");
const { userState } = require("../constants/userStatus");
const tasksModel = require("../models/tasks.js");

const fetchTaskRequests = async (_, res) => {
  try {
    const data = await taskRequestsModel.fetchTaskRequests();

    return res.status(200).json({
      message: "Task requests returned successfully",
      data,
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addOrUpdate = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    if (!taskId) {
      return res.boom.badRequest("taskId not provided");
    }
    if (!userId) {
      return res.boom.badRequest("userId not provided");
    }

    const { userExists } = await userModel.fetchUser({ userId });
    if (!userExists) {
      return res.boom.conflict("User does not exist");
    }

    const { userStatusExists, data: userStatus } = await userStatusModel.getUserStatus(userId);
    if (!userStatusExists) {
      return res.boom.conflict("User status does not exist");
    }
    if (userStatus.currentStatus.state === userState.OOO) {
      return res.boom.conflict("User is currently OOO");
    }
    if (userStatus.currentStatus.state === userState.ACTIVE) {
      return res.boom.conflict("User is currently active on another task");
    }

    const { taskData } = await tasksModel.fetchTask(taskId);
    if (!taskData) {
      return res.boom.conflict("Task does not exist");
    }

    const response = await taskRequestsModel.addOrUpdate(taskId, userId);

    if (response.alreadyRequesting) {
      return res.boom.conflict("User is already requesting for the task");
    }

    if (response.isUpdate) {
      return res.status(200).json({
        message: "Task request successfully updated",
        requestors: response.requestors,
      });
    }

    return res.status(201).json({
      message: "Task request successfully created",
      taskRequest: response.taskRequest,
    });
  } catch (err) {
    logger.error("Error while creating task request");
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId, userId } = req.body;
    if (!taskRequestId) {
      return res.boom.badRequest("taskRequestId not provided");
    }
    if (!userId) {
      return res.boom.badRequest("userId not provided");
    }

    const { userExists, user } = await userModel.fetchUser({ userId });
    if (!userExists) {
      return res.boom.conflict("User does not exists");
    }

    const { userStatusExists, data: userStatus } = await userStatusModel.getUserStatus(userId);
    if (!userStatusExists) {
      return res.boom.conflict("User status does not exists");
    }
    if (userStatus.currentStatus.state === userState.OOO) {
      return res.boom.conflict("User is currently OOO");
    }
    if (userStatus.currentStatus.state === userState.ACTIVE) {
      return res.boom.conflict("User is currently active on another task");
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
};
