const LevelModel = require("../models/levels");
const admin = require("firebase-admin");

/**
 * Creates a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addLevel = async (req, res) => {
  try {
    const { id, levelData } = await LevelModel.addLevel({
      ...req.body,
      createdBy: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return res.json({
      message: "Level created successfully!",
      data: {
        level: levelData,
        id,
      },
    });
  } catch (err) {
    logger.error(`Error while creating new level: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Deletes a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const deleteLevel = async (req, res) => {
  try {
    await LevelModel.deleteLevel(req.params.levelid);
    return res.json({
      message: "Level Deleted successfully!",
    });
  } catch (err) {
    logger.error(`Error while creating new Level: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Collects and returns all levels
 *
 * @param res {Object} - Express response object
 */

const getAllLevels = async (req, res) => {
  try {
    const { allLevels } = await LevelModel.getAllLevels();
    return res.json({
      message: "Levels returned Successfully",
      levels: allLevels,
    });
  } catch (err) {
    logger.error(`Error while creating new Level: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = {
  addLevel,
  deleteLevel,
  getAllLevels,
};
