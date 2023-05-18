const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");

const buildQueryToCheckIfDocExists = (reqBodyParams) => {
  const { userId, taskId } = reqBodyParams;
  if (userId) {
    return trackedProgressesCollection.where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("taskId", "==", taskId);
  }
};

module.exports = { buildQueryToCheckIfDocExists };
