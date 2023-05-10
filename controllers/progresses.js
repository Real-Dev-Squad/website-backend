const { Conflict } = require("http-errors");
const { createProgressDocument, getProgressDocument, getRangeProgressData } = require("../models/progresses");

/**
 * Adds Progresses Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createProgress = async (req, res) => {
  try {
    const data = await createProgressDocument({ ...req.body, userId: req.userData.id });
    return res.status(201).json({
      data,
      message: `${
        req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)
      } Progress document created successfully.`,
    });
  } catch (error) {
    if (error instanceof Conflict) {
      return res.status(409).json({
        message: error.message,
      });
    }
    return res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * Gets Progresses Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getProgress = async (req, res) => {
  try {
    const data = await getProgressDocument(req.query);
    const count = data.length;
    return res.json({
      message: count ? `Progress document retrieved successfully.` : `No Progress document found.`,
      count,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * Gets Progresses Records within the specified date range,
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getProgressRangeData = async (req, res) => {
  try {
    const data = await getRangeProgressData(req.query);
    return res.json({
      message: `Progress document retrieved successfully.`,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = { createProgress, getProgress, getProgressRangeData };
