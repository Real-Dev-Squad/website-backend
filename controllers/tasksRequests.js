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

module.exports = {
  fetchTaskRequests,
};
