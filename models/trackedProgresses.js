const { Conflict, NotFound } = require("http-errors");
const fireStore = require("../utils/firestore");
const trackedProgressesCollection = fireStore.collection("trackedProgresses");
const { assertUserOrTaskExists } = require("../utils/progresses");
const { buildQueryToCheckIfDocExists } = require("../utils/trackedProgresses");
const { TYPE_MAP } = require("../constants/progresses");

const createTrackedProgressDocument = async (reqBody) => {
  const { userId, taskId, frequency } = reqBody;
  // if not passed, the default frequency of 1 will be used as the frequency
  if (!frequency) {
    reqBody.frequency = 1;
  }
  await assertUserOrTaskExists({ userId, taskId });
  const query = buildQueryToCheckIfDocExists({ userId, taskId });
  const existingDocumentSnapshot = await query.get();
  if (!existingDocumentSnapshot.empty) {
    throw new Conflict("Resource is already being tracked.");
  }
  const timeNow = new Date().toISOString();
  const docData = { ...reqBody, createdAt: timeNow, updatedAt: timeNow };
  const { id } = await trackedProgressesCollection.add(docData);
  return { id, ...docData };
};

const updateTrackedProgressDocument = async (req) => {
  const { type, typeId } = req.params;
  const updatedData = { type, [TYPE_MAP[type]]: typeId };
  const query = buildQueryToCheckIfDocExists(updatedData);
  const existingDocumentSnapshot = await query.get();
  if (existingDocumentSnapshot.empty) {
    throw new NotFound("Resource not found.");
  }
  const doc = existingDocumentSnapshot.docs[0];
  const docId = doc.id;
  const docData = { ...req.body, updatedAt: new Date().toISOString() };
  await trackedProgressesCollection.doc(docId).update(docData);
  return { id: docId, ...doc.data(), ...docData };
};

module.exports = { createTrackedProgressDocument, updateTrackedProgressDocument };
