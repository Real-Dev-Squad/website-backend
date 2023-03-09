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
    const { taskId, userId } = req.requestData;

    const taskRequest = await taskRequestsModel.createTaskRequest({ taskId, userId });

    return res.json({
      message: "Task Request created successfully",
      taskRequest,
    });
  } catch (err) {
    logger.error("Error while creating task request");
    throw err;
  }
};

const approveTaskRequest = async (req, res) => {
  try {
    const { taskRequestId } = req.params;
    const { user } = await taskRequestsModel.approveTaskRequest(taskRequestId);

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
