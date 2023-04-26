const firestore = require("../utils/firestore");

const progressUpdatesModel = firestore.collection("progressUpdates");

const addProgressUpdates = async (progressData) => {
  try {
    const { id } = await progressUpdatesModel.add(progressData);
    return { id };
  } catch (error) {
    logger.error(`Unable to add Progress updates ${error}`);
    throw error;
  }
};

const getLatestProgress = async (type, id) => {
  try {
    let progressUpdatesDocs;
    if (type === "TASK") {
      progressUpdatesDocs = await progressUpdatesModel.where("taskId", "==", id).limit(1).get();
    } else if (type === "USER") {
      progressUpdatesDocs = await progressUpdatesModel.where("UserId", "==", id).limit(1).get();
    } else {
      return { id: null, data: null };
    }
    const [progressUpdatesDoc] = progressUpdatesDocs.docs;
    if (progressUpdatesDoc) {
      id = progressUpdatesDoc.id;
      const data = progressUpdatesDoc.data();
      return { id, data };
    } else {
      return { id: null, data: null };
    }
  } catch (error) {
    logger.error(`Error while finding progress updates: ${error}`);
    throw error;
  }
};

module.exports = {
  addProgressUpdates,
  getLatestProgress,
};
