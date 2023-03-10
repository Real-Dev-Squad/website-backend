const taskRequestsModel = require("../models/taskRequests");

const fetchTaskRequests = async (_, res) => {
  try {
    const taskRequests = await taskRequestsModel.fetchTaskRequests();

    return res.json({
      message: "Task Requests returned successfully!",
      taskRequests,
    });
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    throw err;
  }
};

const fetchUserTaskRequests = async (req, res) => {
  try {
    const taskRequests = await taskRequestsModel.fetchTaskRequests(req.params.id);

    return res.json("Task Requests returned successfully", taskRequests);
  } catch (err) {
    logger.error("Error while fetching task requests", err);
    throw err;
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
    throw err;
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId, userId } = req.body;
    const { user } = await taskRequestsModel.approveTaskRequest(taskRequestId, userId);

    res.status(204);
    return res.json({ message: `Task successfully approved to ${user.userName}` });
  } catch (err) {
    logger.error("Error while approving task request", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
  fetchUserTaskRequests,
  createTaskRequest,
  approveTaskRequest,
};
