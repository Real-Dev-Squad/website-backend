const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");

const buildQueryForPostingTrackedProgress = (reqBodyParams) => {
  const { userId, taskId } = reqBodyParams;
  if (userId) {
    return trackedProgressesCollection.where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("taskId", "==", taskId);
  }
};

module.exports = { buildQueryForPostingTrackedProgress };
