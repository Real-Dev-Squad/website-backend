const logsQuery = require("../models/logs");

/**
 * Fetches logs
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchLogs = async (req, res) => {
  try {
    const logs = await logsQuery.fetchLogs(req.query, req.params.type);
    return res.json({
      message: "Logs returned successfully!",
      logs,
    });
  } catch (error) {
    logger.error(`Error while fetching logs: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

/**
 * Fetches member cache logs
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchMemberCacheLogs = async (req, res) => {
  try {
    const { id } = req.userData;
    const logs = await logsQuery.fetchMemberCacheLogs(id);
    return res.json({
      message: "Member Cache Logs returned successfully!",
      count: logs.length,
      logs,
    });
  } catch (error) {
    logger.error(`Error while fetching logs: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = {
  fetchLogs,
  fetchMemberCacheLogs,
};
