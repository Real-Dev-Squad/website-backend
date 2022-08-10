const logsQuery = require("../models/logs");

/**
 * Fetches cache metadata
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fetchPurgedCacheMetadata = async (req, res) => {
  try {
    const { id } = req.userData;
    const logs = await logsQuery.fetchCacheLogs(id);
    if (logs.length !== 0) {
      const latestCacheMetadata = logs[logs.length - 1];
      const { docId, timestamp } = latestCacheMetadata;
      return res.json({
        id: docId,
        message: "Purged cache metadata returned successfully!",
        count: logs.length,
        timestamp: timestamp._seconds,
      });
    } else if ((await logsQuery.fetchLastAddedCacheLog(id)).length !== 0) {
      const lastLog = await logsQuery.fetchLastAddedCacheLog(id);
      const { docId, timestamp } = lastLog[0];
      return res.json({
        id: docId,
        message: "Purged cache metadata returned successfully!",
        count: 0,
        timestamp: timestamp._seconds,
      });
    } else {
      return res.json({
        id: "0",
        message: "Cache will cleared for the first time",
        count: 0,
      });
    }
  } catch (error) {
    logger.error(`Error while fetching cache metadata: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = {
  fetchPurgedCacheMetadata,
};
