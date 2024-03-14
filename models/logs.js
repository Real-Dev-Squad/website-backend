const firestore = require("../utils/firestore");
const { getBeforeHourTime } = require("../utils/time");
const logsModel = firestore.collection("logs");
const admin = require("firebase-admin");
const { logType, ERROR_WHILE_FETCHING_LOGS } = require("../constants/logs");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { getFullName } = require("../utils/users");
const SIZE = 5;

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
    let call = logsModel.where("type", "==", param);
    Object.keys(query).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      if (key !== "limit" && key !== "lastDocId") {
        // eslint-disable-next-line security/detect-object-injection
        call = call.where(key, "==", query[key]);
      }
    });

    const { limit, lastDocId, userId } = query;
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
    if (param === "extensionRequests") {
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

const fetchAllLogs = async (query) => {
  try {
    let { type, prev, next, page, size = SIZE } = query;
    size = parseInt(size);
    page = parseInt(page);

    try {
      let requestQuery = logsModel;

      if (type) {
        const logType = type.split(",");
        if (logType.length >= 1) requestQuery = requestQuery.where("type", "in", logType);
      }

      requestQuery = requestQuery.orderBy("timestamp", "desc");
      let requestQueryDoc = requestQuery;

      if (prev) {
        requestQueryDoc = requestQueryDoc.limitToLast(size);
      } else {
        requestQueryDoc = requestQueryDoc.limit(size);
      }

      if (page) {
        const startAfter = (page - 1) * size;
        requestQueryDoc = requestQueryDoc.offset(startAfter);
      } else if (next) {
        const doc = await logsModel.doc(next).get();
        requestQueryDoc = requestQueryDoc.startAt(doc);
      } else if (prev) {
        const doc = await logsModel.doc(prev).get();
        requestQueryDoc = requestQueryDoc.endAt(doc);
      }

      const snapshot = await requestQueryDoc.get();
      let nextDoc, prevDoc;
      if (!snapshot.empty) {
        const first = snapshot.docs[0];
        prevDoc = await requestQuery.endBefore(first).limitToLast(1).get();

        const last = snapshot.docs[snapshot.docs.length - 1];
        nextDoc = await requestQuery.startAfter(last).limit(1).get();
      }
      const allLogs = [];
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          allLogs.push({ ...doc.data() });
        });
      }

      if (allLogs.length === 0) {
        return null;
      }

      return {
        allLogs,
        prev: prevDoc.empty ? null : prevDoc.docs[0].id,
        next: nextDoc.empty ? null : nextDoc.docs[0].id,
        page: page ? page + 1 : null,
      };
    } catch (error) {
      logger.error(ERROR_WHILE_FETCHING_LOGS, error);
      throw error;
    }
    // if (type) {
    //   const logType = type.split(",");
    //   if (logType.length >= 1) initialQuery = initialQuery.where("type", "in", logType);
    // }
    //
    // let queryDoc = initialQuery;
    //
    // if (prev) {
    //   queryDoc = queryDoc.limitToLast(size);
    // } else {
    //   queryDoc = queryDoc.limit(size);
    // }
    //
    // const snapshot = await queryDoc.get();
    // let logsData = [];
    //
    // if (!snapshot.empty) {
    //   snapshot.forEach((doc) => {
    //     logsData.push({ ...doc.data() });
    //   });
    // }
    // if (format === "feed") {
    //   const extensionLog = {
    //     type: logType.EXTENSION_REQUESTS,
    //     meta: {
    //       taskId: "6yH97tlNH053Z8oSvW9E",
    //       createdBy:"S5d1xNU1ZTYMWTaahjqp",
    //     },
    //     body: {
    //       extensionRequestId: "HKEMNTbaRzIiTVeTLbAM",
    //       oldEndsOn: 1707264000,
    //       newEndsOn: 1706918400,
    //       assignee: "S5d1xNU1ZTYMWTaahjqp",
    //       status: EXTENSION_REQUEST_STATUS.PENDING,
    //     },
    //   };
    //
    //   await addLog(extensionLog.type, extensionLog.meta, extensionLog.body);
    //
    //
    //   logsData = logsData.map(async (data) => {
    //     return await formatLogs(data);
    //   });
    //   return await Promise.all(logsData);

    // return logsData ?? [];
  } catch (err) {
    logger.error("Error in fetching all logs", err);
    throw err;
  }
};

module.exports = {
  addLog,
  fetchLogs,
  fetchCacheLogs,
  fetchLastAddedCacheLog,
  fetchAllLogs,
};
