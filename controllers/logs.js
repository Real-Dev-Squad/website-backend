const logsQuery = require("../models/logs");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const db = require("../utils/firestore");

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

const createLogs=async (req, res) => {
  try {
    // Extract data from the request body
    const logData = req.body;

    // Save data to Firestore logs collection
    const logsCollection = db.collection('logs');
    await logsCollection.add(logData);

    res.status(201).json({ message: 'Log saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
module.exports = {
  fetchLogs,
  createLogs,
};
