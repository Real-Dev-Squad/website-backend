const LevelModel = require("../models/levels");

/**
 * Creates a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addLevel = async (req, res) => {
  try {
    const { id, levelData, wasCreated } = await LevelModel.addLevel(req.body);
    return res.json({
      message: wasCreated ? "Level created successfully!" : "Level already exists!",
      level: levelData,
      id,
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
    const { id } = await LevelModel.deleteLevel(req.body);
    return res.json({
      message: "Level Deleted successfully!",
      id,
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
      allLevels,
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
