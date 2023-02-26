const firestore = require("../utils/firestore");
// const userStatusModel = firestore.collection("userStatus");
const taskRequestsModel = firestore.collection("taskRequests");

const fetchTaskRequests = async () => {
  try {
    const taskRequestsSnapshot = await taskRequestsModel().get();
    const tasksRequests = [];

    taskRequestsSnapshot.forEach((taskRequest) => {
      tasksRequests.push(taskRequest);
    });
    return tasksRequests;
  } catch (err) {
    logger.error("error fetching tasks", err);
    throw err;
  }
};

module.exports = {
  fetchTaskRequests,
};
