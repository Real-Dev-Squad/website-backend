const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const taskRequestsModel = require("../models/taskRequests");

const fetchTaskRequests = async (_, res) => {
  try {
    const taskRequests = await taskRequestsModel.fetchTaskRequests();

    return res.status(200).json({
      message: "Task requests returned successfully",
      taskRequests,
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const createTaskRequest = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    if (!taskId) {
      return res.boom.badRequest("taskId not provided");
    }
    if (!userId) {
      return res.boom.badRequest("userId not provided");
    }

    const response = await taskRequestsModel.createTaskRequest(taskId, userId);
    if (response.userDoesNotExists) {
      return res.boom.conflict("User does not exist");
    }
    if (response.requestorExists) {
      return res.boom.conflict("User is already requesting for the task");
    }
    if (response.taskRequestDoesNotExist) {
      return res.boom.conflict("Task request already exist");
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
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId, userId } = req.body;

    if (!taskRequestId || !userId) {
      return res.boom.badRequest("Invalid request body");
    }

    const response = await taskRequestsModel.approveTaskRequest(taskRequestId, userId);

    if (response.userDoesNotExists) {
      return res.boom.conflict("User does not exists");
    }
    if (response.userStatusDoesNotExists) {
      return res.boom.conflict("User status does not exists");
    }

    if (response.isUserOOO) {
      return res.boom.conflict("User is currently OOO");
    }
    if (response.isUserActive) {
      return res.boom.conflict("User is currently active on another task");
    }

    return res.status(200).json({
      message: `Task successfully assigned to user ${response.approvedTo}`,
      taskRequest: response.taskRequest,
    });
  } catch (err) {
    logger.error("Error while approving task request", err);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  approveTaskRequest,
  createTaskRequest,
  fetchTaskRequests,
};
