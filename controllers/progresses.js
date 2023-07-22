const { Conflict, NotFound } = require("http-errors");
const {
  createProgressDocument,
  getProgressDocument,
  getRangeProgressData,
  getProgressByDate,
} = require("../models/progresses");
const { RESPONSE_MESSAGES, INTERNAL_SERVER_ERROR_MESSAGE } = require("../constants/progresses");
const { PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED, PROGRESS_DOCUMENT_CREATED_SUCCEEDED } = RESPONSE_MESSAGES;

/**
 * @typedef {Object} ProgressRequestBody
 * @property {string} type - The type of progress document.
 * @property {string} completed - The completed progress.
 * @property {string} planned - The planned progress.
 * @property {string} blockers - The blockers.
 * @property {string} [taskId] - The task ID (optional).
 */

/**
 * @typedef {Object} ProgressDocument
 * @property {string} type - The type of progress document.
 * @property {string} completed - The completed progress.
 * @property {string} planned - The planned progress.
 * @property {string} blockers - The blockers.
 * @property {string} userId - The User ID
 * @property {string} [taskId] - The task ID (optional).
 * @property {number} createdAt - The timestamp when the progress document was created.
 * @property {number} date - The timestamp for the day the progress document was created.
 */

/**
 * @typedef {Object} ProgressResponse
 * @property {ProgressDocument} data - The progress document data.
 * @property {string} message - The success message.
 */

/**
 * Creates a new progress document.
 * @param {Object} req - The HTTP request object.
 * @param {ProgressRequestBody} req.body - The progress document data.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
 */

const createProgress = async (req, res) => {
  const {
    body: { type },
  } = req;
  try {
    const date = new Date();
    if (date.getDay() === 0) {
      return res.status(500).json({
        message: "Progress document cannot be created on a Sunday",
      });
    }
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
    } else if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    logger.error(error.message);
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

/**
 * @typedef {Object} ProgressQueryParams
 * @property {string} [type] - The type of progress document.
 * @property {string} [taskId] - The task ID (optional).
 * @property {string} [userId] - The user ID (optional).
 */

/**
 * @typedef {Object} ProgressDocument
 * @property {string} type - The type of progress document.
 * @property {string} completed - The completed progress.
 * @property {string} planned - The planned progress.
 * @property {string} blockers - The blockers.
 * @property {string} userId - The User ID
 * @property {string} [taskId] - The task ID (optional).
 * @property {number} createdAt - The timestamp when the progress document was created.
 * @property {number} date - The timestamp for the day the progress document was created.
 */

/**
 * @typedef {Object} GetProgressResponse
 * @property {string} message - The success message.
 * @property {number} count - The no of progress documents retrieved
 * @property {[ProgressDocument]} data - An array of progress documents
 */

/**
 * Retrieves the progress documents based on provided query parameters.
 * @param {Object} req - The HTTP request object.
 * @param {ProgressQueryParams} req.query - The query parameters
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
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
    logger.error(error.message);
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

/**
 * @typedef {Object} ProgressQueryParams
 * @property {string} [taskId] - The task ID (optional).
 * @property {string} [userId] - The user ID (optional).
 * @property {string} startDate - The start date of the date range to retrieve progress records for.
 * @property {string} endDate - The end date of the date range to retrieve progress records for.
 */

/**
 * @typedef {Object} progressRecord
 * @property {boolean} date - the boolean indicating whether the progress was recorded or not for that date
/**

/**
 * @typedef {Object} ProgressRangeData
 * @property {string} startDate - the start date for the progress records
 * @property {string} endDate - the end date for the progress records
 * @property {Object.<string, progressRecord>} progressRecords - An object where the keys are dates and the values are progress records.
/**

/**
 * @typedef {Object} GetProgressRangeDataResponse
 * @property {string} message - The success message.
 * @property {ProgressRangeData} data - The progress range data.
 */

/**
 * Retrieves the progress documents based on provided query parameters.
 * @param {Object} req - The HTTP request object.
 * @param {ProgressQueryParams} req.query - The query parameters
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
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
    logger.error(error.message);
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

/**
 * @typedef {Object} progressPathParams
 * @property {string} type - The type of progress document user or task.
 * @property {string} typeId - The ID of the type.
 * @property {string} date - The iso format date of the query.
 */

/**
 * @typedef {Object} ProgressDocument
 * @property {string} id - The id of the progress document.
 * @property {string} type - The type of progress document.
 * @property {string} completed - The completed progress.
 * @property {string} planned - The planned progress.
 * @property {string} blockers - The blockers.
 * @property {string} userId - The User ID
 * @property {string} [taskId] - The task ID (optional).
 * @property {number} createdAt - The timestamp when the progress document was created.
 * @property {number} date - The timestamp for the day the progress document was created.
 */

/**
 * @typedef {Object} GetProgressByDateResponse
 * @property {string} message - The success message.
 * @property {ProgressDocument} data - An array of progress documents
 */

/**
 * Retrieves the progress documents based on provided query parameters.
 * @param {Object} req - The HTTP request object.
 * @param {progressPathParams} req.params - The query parameters
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
 */

const getProgressBydDateController = async (req, res) => {
  try {
    const data = await getProgressByDate(req.params);
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
    logger.error(error.message);
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

module.exports = { createProgress, getProgress, getProgressRangeData, getProgressBydDateController };
