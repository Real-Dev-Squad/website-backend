/**
 * Validates task request object to create firestore document
 * @params taskRequest { Object } task request object
 * @returns taskRequestDocument { Object } task request object valid for firestore
 */
const toFirestoreData = (taskRequest) => {
  const taskRequestDocument = {};

  for (const key in taskRequest) {
    if (taskRequest[key]) {
      taskRequestDocument[key] = taskRequest[key];
    }
  }

  return taskRequestDocument;
};

module.exports = {
  toFirestoreData,
};
