const firestore = require("../utils/firestore");
const levelModel = firestore.collection("levels");

/**
 *
 * @param levelData { Object }: Data of the level
 * @returns {Promise<tagModel|Object>}
 */

const addLevel = async (levelData) => {
  try {
    const alreadyIsTag = await levelModel.where("name", "==", levelData.name).get();
    if (alreadyIsTag) {
      return { id: "", levelData, wasCreated: false };
    }
    const { id } = await levelModel.add(levelData);
    return { id, levelData, wasCreated: true };
  } catch (err) {
    logger.error("Error in creating Level", err);
    throw err;
  }
};

/**
 *
 * @param id { String }: id of the level to be deleted
 * @returns {Promise<tagModel|String>}
 */

const deleteLevel = async (id) => {
  try {
    await levelModel.doc(id).delete();
    return { id };
  } catch (err) {
    logger.error("Error in deleting Level", err);
    throw err;
  }
};

/**
 *
 * @returns {Promise<tagModel|Array>}
 */

const getAllLevels = async () => {
  const data = await levelModel.get();
  const allLevels = [];
  data.forEach((doc) => {
    const Level = {
      id: doc.id,
      name: doc.data().name,
      createdBy: doc.data().createdBy,
      date: doc.data().date,
    };
    allLevels.push(Level);
  });
  return { allLevels };
};

module.exports = {
  addLevel,
  deleteLevel,
  getAllLevels,
};
