const taskRequestsModel = require("../models/taskRequests");

const fetchTaskRequests = async (_, res) => {
  try {
    const taskRequests = await taskRequestsModel.fetchTaskRequests();

    if (taskRequests && taskRequests.length > 0) {
      return res.status(200).json({
        message: "Task requests returned successfully",
        taskRequests,
      });
    }

    return res.status(400).json({
      message: "Unable to fetch task requests",
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const createTaskRequest = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const taskRequestResponse = await taskRequestsModel.createTaskRequest(taskId, userId);

    if (taskRequestResponse.message.includes("updated")) {
      return res.status(200).json(taskRequestResponse);
    }

    if (taskRequestResponse.message.includes("created")) {
      return res.status(201).json(taskRequestResponse);
    }

    return res.status(400).json({ message: taskRequestResponse.message });
  } catch (err) {
    logger.error("Error while creating task request");
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const updateTaskRequest = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const taskRequestResponse = await taskRequestsModel.updateTaskRequest(taskId, userId);

    return res.status(200).json({
      message: "Task updated successfully",
      taskRequestResponse,
    });
  } catch (err) {
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId, userId } = req.body;
    const response = await taskRequestsModel.approveTaskRequest(taskRequestId, userId);

    return res.status(200).json(response);
  } catch (err) {
    logger.error("Error while approving task request", err);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  approveTaskRequest,
  createTaskRequest,
  fetchTaskRequests,
  updateTaskRequest,
};
