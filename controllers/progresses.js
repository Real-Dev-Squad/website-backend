const { Conflict, NotFound } = require("http-errors");
const { createProgressDocument, getProgressDocument, getRangeProgressData } = require("../models/progresses");
const { RESPONSE_MESSAGES } = require("../constants/progresses");
const { PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED, PROGRESS_DOCUMENT_CREATED_SUCCEEDED } = RESPONSE_MESSAGES;

/**
 * Adds Progress Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const createProgress = async (req, res) => {
  const {
    body: { type },
  } = req;
  try {
    const data = await createProgressDocument({ ...req.body, userId: req.userData.id });
    return res.status(201).json({
      data,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${PROGRESS_DOCUMENT_CREATED_SUCCEEDED}`,
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
 * Gets Progress Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getProgress = async (req, res) => {
  try {
    const data = await getProgressDocument(req.query);
    return res.json({
      message: PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
      count: data.length,
      data,
    });
  } catch (error) {
    if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    return res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * Gets Progress Records within the specified date range
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getProgressRangeData = async (req, res) => {
  try {
    const data = await getRangeProgressData(req.query);
    return res.json({
      message: PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
      data,
    });
  } catch (error) {
    if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = { createProgress, getProgress, getProgressRangeData };
