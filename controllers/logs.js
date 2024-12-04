import { getPaginatedLink } from "../utils/helper";
import { ALL_LOGS_FETCHED_SUCCESSFULLY, ERROR_WHILE_FETCHING_LOGS, LOGS_FETCHED_SUCCESSFULLY } from "../constants/logs";
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
      message: LOGS_FETCHED_SUCCESSFULLY,
      logs,
    });
  } catch (error) {
    logger.error(`${ERROR_WHILE_FETCHING_LOGS}: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const fetchAllLogs = async (req, res) => {
  const { query } = req;
  try {
    const logs = await logsQuery.fetchAllLogs(query);
    if (logs.length === 0) {
      return res.status(204).send();
    }
    const { allLogs, next, prev, page } = logs;
    if (page) {
      const pageLink = `/logs?page=${page}`;
      return res.status(200).json({
        message: ALL_LOGS_FETCHED_SUCCESSFULLY,
        data: allLogs,
        page: pageLink,
      });
    }

    let nextUrl = null;
    let prevUrl = null;
    if (next) {
      const nextLink = getPaginatedLink({
        endpoint: "/logs",
        query,
        cursorKey: "next",
        docId: next,
      });
      nextUrl = nextLink;
    }
    if (prev) {
      const prevLink = getPaginatedLink({
        endpoint: "/logs",
        query,
        cursorKey: "prev",
        docId: prev,
      });
      prevUrl = prevLink;
    }

    return res.status(200).json({
      message: ALL_LOGS_FETCHED_SUCCESSFULLY,
      data: allLogs,
      next: nextUrl,
      prev: prevUrl,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    logger.error(ERROR_WHILE_FETCHING_LOGS, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_LOGS);
  }
};

module.exports = {
  fetchLogs,
  fetchAllLogs,
};
