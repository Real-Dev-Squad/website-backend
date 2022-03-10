const logsQuery = require("../models/logs");

/**
 * Fetches logs
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetch = async (req, res) => {
  try {
    const logs = await logsQuery.fetch(req.query, req.params.type);
    return res.json({
      message: "Logs returned successfully!",
      logs,
    });
  } catch (error) {
    logger.error(`Error while fetching logs: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = {
  fetch,
};
