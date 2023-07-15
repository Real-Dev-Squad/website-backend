const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const taskRequestsModel = require("../models/taskRequests");
const tasksModel = require("../models/tasks.js");

const fetchTaskRequests = async (_, res) => {
  try {
    const data = await taskRequestsModel.fetchTaskRequests();

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

    if (data.taskRequestExists) {
      res.status(200).json({
        message: "Task request returned successfully",
        data: data.taskRequestData,
      });
    }

    return res.status(404).json({
      message: "Task request not found",
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
};
