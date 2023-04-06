const { EventAPIService } = require("../services/EventAPIService");
const { EventTokenService } = require("../services/EventTokenService");
const logger = require("../utils/logger");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

/**
 * Retrieves sessions with optional filters and returns JSON response
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing session data or error message
 * @throws {Object} - Error object if session retrieval fails
 */
const getAllSessions = async (req, res) => {
  const { enabled, hits, offset } = req.query;
  try {
    const start = offset || "";
    const sessionsData = await apiService.get(`/sessions?limit=${hits}&active=${enabled}&start=${start}`);
    return res.status(200).json(sessionsData);
  } catch (error) {
    logger.error({ error });
    return res.status(500).json({
      error: error.code,
      message: "Couldn't get sessions. Please try again later",
    });
  }
};

/**
 * Retrieves session data for a session with the given ID and returns JSON response
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response containing session data or error message
 * @throws {Object} - Error object if session retrieval fails
 */
const getSessionById = async (req, res) => {
  const sessionId = req.params.id;
  try {
    const sessionData = await apiService.get(`/sessions/${sessionId}`);
    return res.status(200).json(sessionData);
  } catch (error) {
    logger.error({ error });
    if (error.status === 404) {
      return res.status(404).json({
        error: error.code,
        message: "Session not found",
      });
    }
    return res.status(500).json({
      error: error.code,
      message: "Unable to retrieve session details",
    });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
};
