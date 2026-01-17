const { Conflict, NotFound } = require("http-errors");
const progressesModel = require("../models/progresses");
const {
  PROGRESSES_RESPONSE_MESSAGES,
  INTERNAL_SERVER_ERROR_MESSAGE,
  PROGRESSES_SIZE,
  PROGRESSES_PAGE_SIZE,
  UNAUTHORIZED_WRITE,
} = require("../constants/progresses");
const { sendTaskUpdate } = require("../utils/sendTaskUpdate");
const { PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED, PROGRESS_DOCUMENT_CREATED_SUCCEEDED } = PROGRESSES_RESPONSE_MESSAGES;

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
  if (req.userData.roles?.archived || req.userData.roles?.in_discord !== true) {
    return res.boom.forbidden(UNAUTHORIZED_WRITE);
  }

  const {
    body: { type, completed, planned, blockers, taskId },
  } = req;
  try {
    const { data, taskTitle } = await progressesModel.createProgressDocument({ ...req.body, userId: req.userData.id });
    await sendTaskUpdate(completed, blockers, planned, req.userData.username, taskId, taskTitle);
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
  const { dev, page = PROGRESSES_PAGE_SIZE, size = PROGRESSES_SIZE, type, userId, taskId } = req.query;
  try {
    if (dev === "true") {
      const { progressDocs, totalProgressCount } = await progressesModel.getPaginatedProgressDocument(req.query);
      const limit = parseInt(size, 10);
      const offset = parseInt(page, 10) * limit;
      const nextPage = offset + limit < totalProgressCount ? parseInt(page, 10) + 1 : null;
      const prevPage = page > 0 ? parseInt(page, 10) - 1 : null;
      let baseUrl = `${req.baseUrl}`;
      if (type) {
        baseUrl += `?type=${type}`;
      } else if (userId) {
        baseUrl += `?userId=${userId}`;
      } else if (taskId) {
        baseUrl += `?taskId=${taskId}`;
      }
      const nextLink = nextPage !== null ? `${baseUrl}&page=${nextPage}&size=${size}&dev=${dev}` : null;
      const prevLink = prevPage !== null ? `${baseUrl}&page=${prevPage}&size=${size}&dev=${dev}` : null;
      return res.json({
        message: PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
        count: progressDocs.length,
        data: progressDocs,
        links: {
          prev: prevLink,
          next: nextLink,
        },
      });
    }
    const data = await progressesModel.getProgressDocument(req.query);
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
    const data = await progressesModel.getRangeProgressData(req.query);
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
    const data = await progressesModel.getProgressByDate(req.params, req.query);
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
 * Creates multiple progress documents in bulk.
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing an array of progress records.
 * @param {Array<ProgressRequestBody>} req.body.records - Array of progress records to create.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
 */
const createBulkProgress = async (req, res) => {
  if (req.userData.roles.archived) {
    return res.boom.forbidden(UNAUTHORIZED_WRITE);
  }

  const { records } = req.body;
  
  try {
    // Add userId to each record
    const recordsWithUserId = records.map(record => ({
      ...record,
      userId: req.userData.id
    }));
    
    const result = await progressesModel.createBulkProgressDocuments(recordsWithUserId);
    
    return res.status(201).json({
      message: `Successfully created ${result.successCount} progress records`,
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        successfulRecords: result.successfulRecords,
        failedRecords: result.failedRecords
      }
    });
  } catch (error) {
    logger.error(`Error in bulk progress creation: ${error.message}`);
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

module.exports = { 
  createProgress, 
  getProgress, 
  getProgressRangeData, 
  getProgressBydDateController,
  createBulkProgress
};
