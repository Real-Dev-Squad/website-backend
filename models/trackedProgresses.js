const { Conflict } = require("http-errors");
const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");
const { assertUserOrTaskExists } = require("../utils/progresses");
const { buildQueryForPostingTrackedProgress } = require("../utils/trackedProgresses");

const createTrackedProgressDocument = async (reqBody) => {
  const { userId, taskId, frequency } = reqBody;
  // if not passed, the default frequency of 1 will be used as the frequency
  if (!frequency) {
    reqBody.frequency = 1;
  }
  await assertUserOrTaskExists({ userId, taskId });
  const query = buildQueryForPostingTrackedProgress({ userId, taskId });
  const existingDocumentSnapshot = await query.get();
  if (!existingDocumentSnapshot.empty) {
    throw new Conflict("Resource is already being tracked.");
  }
  const timeNow = new Date().toISOString();
  const docData = { ...reqBody, createdAt: timeNow, updatedAt: timeNow };
  const { id } = await trackedProgressesCollection.add(docData);
  return { id, ...docData };
};

module.exports = { createTrackedProgressDocument };
