const { Conflict, NotFound } = require("http-errors");
const { INTERNAL_SERVER_ERROR_MESSAGE } = require("../constants/progresses");
const {
  createTrackedProgressDocument,
  updateTrackedProgressDocument,
  getTrackedProgressDocuments,
} = require("../models/monitor");
const { RESPONSE_MESSAGES } = require("../constants/monitor");
const { RESOURCE_CREATED_SUCCEEDED, RESOURCE_UPDATED_SUCCEEDED, RESOURCE_RETRIEVAL_SUCCEEDED } = RESPONSE_MESSAGES;
/**
 * @typedef {Object} TrackedProgressRequestBody
 * @property {string} type - The type of tracked progress ("user" or "task").
 * @property {string} [userId] - The user ID (required if type is "user").
 * @property {string} [taskId] - The task ID (required if type is "task").
 * @property {boolean} monitored - Indicates if the progress is currently being tracked.
 * @property {number} [frequency=1] - The frequency of tracking.By default 1 if not specified
 */

/**
 * @typedef {Object} TrackedProgressResponseData
 * @property {string} id - The ID of the tracked progress document.
 * @property {string} type - The type of tracked progress ("user" or "task").
 * @property {string} userId - The user ID.
 * @property {boolean} monitored - Indicates if the progress is currently being tracked.
 * @property {number} frequency - The frequency of tracking.
 * @property {string} createdAt - The timestamp when the document was created.
 * @property {string} updatedAt - The timestamp when the document was last updated.
 */

/**
 * @typedef {Object} TrackedProgressResponse
 * @property {TrackedProgressResponseData} data - The data of the tracked progress document.
 * @property {string} message - The success message.
 */

/**
 * Controller function for creating a tracked progress document.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {TrackedProgressRequestBody} req.body - The Request body object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 */

const createTrackedProgressController = async (req, res) => {
  try {
    const data = await createTrackedProgressDocument({ ...req.body });
    return res.status(201).json({
      message: RESOURCE_CREATED_SUCCEEDED,
      data,
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
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

/**
 * @typedef {Object} UpdateTrackedProgressRequestParams
 * @property {string} type - The type of tracked progress ("user" or "task").
 * @property {string} id - The ID of the tracked progress document.
 */

/**
 * @typedef {Object} UpdateTrackedProgressRequestBody
 * @property {number} frequency - The frequency of tracking.
 * @property {boolean} monitored - Indicates if the progress is currently being tracked.
 */

/**
 * @typedef {Object} UpdateTrackedProgressResponseData
 * @property {string} id - The ID of the tracked progress document.
 * @property {string} createdAt - The timestamp when the document was created.
 * @property {string} type - The type of tracked progress ("user" or "task").
 * @property {string} userId - The user ID.
 * @property {number} frequency - The frequency of tracking.
 * @property {boolean} monitored - Indicates if the progress is currently being tracked.
 * @property {string} updatedAt - The timestamp when the document was last updated.
 */

/**
 * @typedef {Object} UpdateTrackedProgressResponse
 * @property {UpdateTrackedProgressResponseData} data - The data of the tracked progress document.
 * @property {string} message - The success message.
 */

/**
 * Controller function for updating a tracked progress document.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {UpdateTrackedProgressRequestParams} req.params - The request path parameters.
 * @param {UpdateTrackedProgressRequestBody} req.body - The request body object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the response has been sent.
 */

const updateTrackedProgressController = async (req, res) => {
  try {
    const data = await updateTrackedProgressDocument({ ...req });
    return res.status(200).json({
      data,
      message: RESOURCE_UPDATED_SUCCEEDED,
    });
  } catch (error) {
    if (error instanceof NotFound) {
      return res.status(404).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

/**
 * @typedef {Object} GetTrackedProgressRequestParams
 * @property {string} [type] - The type of tracked progress ("user" or "task").
 * @property {string} [monitored] - Indicates if the progress is currently being tracked.
 * @property {string} [userId] - The ID of the User who is currently being tracked.
 * @property {string} [taskId] - The ID of the task which is currently being tracked.
 */

/**
 * @typedef {Object} TrackedProgressData
 * @property {string} id - The ID of the tracked progress document.
 * @property {boolean} monitored - Indicates if the progress is currently being tracked.
 * @property {string} createdAt - The timestamp when the document was created.
 * @property {string} type - The type of tracked progress ("user" or "task").
 * @property {string} [userId] - The user ID.
 * @property {string} [taskId] - The task ID.
 * @property {number} frequency - The frequency of tracking.
 * @property {string} updatedAt - The timestamp when the document was last updated.
 */

/**
 * @typedef {Object} GetTrackedProgressResponse
 * @property {string} message - The success message.
 * @property {TrackedProgressData | TrackedProgressData[]} data - The data of the tracked progress document(s).
 */

/**
 * Controller function for retrieving tracked progress documents.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<void>} A Promise that resolves when the response has been sent.
 */

const getTrackedProgressController = async (req, res) => {
  try {
    const data = await getTrackedProgressDocuments({ ...req.query });
    return res.status(200).json({
      message: RESOURCE_RETRIEVAL_SUCCEEDED,
      data,
    });
  } catch (error) {
    if (error instanceof NotFound) {
      const response = {
        message: error.message,
      };
      if (req.query.type) {
        response.data = [];
      }
      return res.status(404).json(response);
    }
    return res.status(500).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

module.exports = {
  createTrackedProgressController,
  updateTrackedProgressController,
  getTrackedProgressController,
};
