const firestore = require("../utils/firestore");
const { getBeforeHourTime } = require("../utils/time");
const logsModel = firestore.collection("logs");
const admin = require("firebase-admin");
const { logType } = require("../constants/logs");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { getFullName } = require("../utils/users");

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
    return await logsModel.add(log);
  } catch (err) {
    logger.error("Error in adding log", err);
    throw new Error(INTERNAL_SERVER_ERROR);
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
    const { dev, ...remainingQuery } = query;
    let call = logsModel.where("type", "==", param);
    Object.keys(remainingQuery).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      if (key !== "limit" && key !== "lastDocId") {
        // eslint-disable-next-line security/detect-object-injection
        call = call.where(key, "==", remainingQuery[key]);
      }
    });

    const { limit, lastDocId, userId } = remainingQuery;
    let lastDoc;
    const limitDocuments = Number(limit);

    if (lastDocId) {
      lastDoc = await logsModel.doc(lastDocId).get();
    }
    if (userId) {
      const logsSnapshot = await logsModel
        .where("type", "==", param)
        .where("body.archived_user.user_id", "==", userId)
        .orderBy("timestamp", "desc")
        .get();
      const logs = [];
      logsSnapshot.forEach((doc) => {
        logs.push({
          ...doc.data(),
        });
      });
      return logs;
    }
    const logsSnapshotQuery = call.orderBy("timestamp", "desc").startAfter(lastDoc ?? "");
    const snapshot = limit
      ? await logsSnapshotQuery.limit(limitDocuments).get()
      : await logsSnapshotQuery.limit(10).get();

    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({
        ...doc.data(),
      });
    });

    // If dev flag is presend and extensionRequest logs are requested, populate userId
    if (dev === "true" && param === "extensionRequests") {
      const userIdNameMap = {};
      for await (const log of logs) {
        if (log.meta.userId) {
          if (userIdNameMap[log.meta.userId]) {
            log.meta.name = userIdNameMap[log.meta.userId];
          } else {
            const name = await getFullName(log.meta.userId);
            log.meta.name = `${name?.first_name} ${name?.last_name}`;
            userIdNameMap[log.meta.userId] = log.meta.name;
          }
        }
      }
    }
    return logs;
  } catch (err) {
    logger.error("Error in adding log", err);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Fetches purged cache logs
 *
 * @param userId { String }: Unique ID of the User
 */
const fetchCacheLogs = async (id) => {
  try {
    const logsSnapshot = await logsModel
      .where("type", "==", logType.CLOUDFLARE_CACHE_PURGED)
      .where("timestamp", ">=", getBeforeHourTime(admin.firestore.Timestamp.fromDate(new Date()), 24))
      .where("meta.userId", "==", id)
      .get();

    const logs = [];
    logsSnapshot.forEach((doc) => {
      const { timestamp } = doc.data();
      if (logs.length < 3) {
        logs.push({ timestamp });
      }
    });

    return logs;
  } catch (err) {
    logger.error("Error in fetching cache logs", err);
    throw err;
  }
};

/**
 * Fetches last purged cache log added
 *
 * @param userId { String }: Unique ID of the User
 */
const fetchLastAddedCacheLog = async (id) => {
  try {
    const lastLogSnapshot = await logsModel
      .where("type", "==", logType.CLOUDFLARE_CACHE_PURGED)
      .where("meta.userId", "==", id)
      .limit(1)
      .orderBy("timestamp", "desc")
      .get();

    const logs = [];
    lastLogSnapshot.forEach((doc) => {
      const { timestamp } = doc.data();
      logs.push({ timestamp });
    });

    return logs;
  } catch (err) {
    logger.error("Error in fetching purged cache logs", err);
    throw err;
  }
};

module.exports = {
  addLog,
  fetchLogs,
  fetchCacheLogs,
  fetchLastAddedCacheLog,
};
