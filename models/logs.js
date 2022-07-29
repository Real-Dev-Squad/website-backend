const firestore = require("../utils/firestore");
const { getLast24HourTime } = require("../utils/time");
const logsModel = firestore.collection("logs");
const admin = require("firebase-admin");
const { logType } = require("../constants/logs");

/**
 * Adds log
 *
 * @param type { String }: Type of the log
 * @param meta { Object }: Meta data of the log
 * @param body { Object }: Body of the log
 */
const addLog = async (type, meta, body) => {
  try {
    const log = {
      type,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      meta,
      body,
    };
    await logsModel.add(log);
  } catch (err) {
    logger.error("Error in adding log", err);
    throw err;
  }
};

/**
 * Fetches logs
 *
 * @param query { String }: Type of the log
 * @param param { Object }: Fields to filter logs
 */
const fetchLogs = async (query, param) => {
  try {
    let call = logsModel.where("type", "==", param);
    Object.keys(query).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      call = call.where(key, "==", query[key]);
    });

    const snapshot = await call.get();
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({
        ...doc.data(),
      });
    });
    return logs;
  } catch (err) {
    logger.error("Error in fetching logs", err);
    throw err;
  }
};

/**
 * Fetches member cache Self logs
 *
 * @param userId { String }: Unique ID of the User
 */
const fetchMemberCacheLogs = async (id) => {
  try {
    const logsSnapshot = await logsModel
      .where("type", "==", logType.CLOUDFLARE_CACHE_PURGED)
      .where("timestamp", ">=", getLast24HourTime(admin.firestore.Timestamp.fromDate(new Date())))
      .where("meta.userId", "==", id)
      .get();

    const logs = [];
    logsSnapshot.forEach((doc) => {
      logs.push({
        ...doc.data(),
      });
    });

    const logData = {
      logs: logs,
      count: logs.length,
    };

    return logData;
  } catch (err) {
    logger.error("Error in fetching cache logs", err);
    throw err;
  }
};

module.exports = {
  addLog,
  fetchLogs,
  fetchMemberCacheLogs,
};
