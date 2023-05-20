const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");

const buildQueryToCheckIfDocExists = (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    return trackedProgressesCollection.where("userId", "==", userId);
  } else {
    return trackedProgressesCollection.where("taskId", "==", taskId);
  }
};

const buildQueryForFetchingDocsOfType = (queryParams) => {
  const { type, marked } = queryParams;
  let query = trackedProgressesCollection.where("type", "==", type);
  if (marked !== undefined) {
    query = query.where("marked", "==", marked);
  }
  return query;
};

const buildQueryForFetchingSpecificDoc = (queryParams) => {
  const { type, typeId } = queryParams;
  const query = trackedProgressesCollection.where("type", "==", type);
  if (type === "user") {
    return query.where("userId", "==", typeId);
  } else {
    return query.where("taskId", "==", typeId);
  }
};

module.exports = { buildQueryToCheckIfDocExists, buildQueryForFetchingDocsOfType, buildQueryForFetchingSpecificDoc };
