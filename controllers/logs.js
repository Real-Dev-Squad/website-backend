const logsQuery = require("../models/logs");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

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
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  fetchLogs,
};
