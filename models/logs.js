const firestore = require("../utils/firestore");
const logsModel = firestore.collection("logs");
const admin = require("firebase-admin");

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
      if (key !== "limit" && key !== "lastDocId") {
        call = call.where(key, "==", query[key]);
      }
    });

    const { limit, lastDocId } = query;
    let lastDoc;
    const limitDocuments = Number(limit);

    if (lastDocId) {
      lastDoc = await logsModel.doc(lastDocId).get();
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
    return logs;
  } catch (err) {
    logger.error("Error in adding log", err);
    throw err;
  }
};

module.exports = {
  addLog,
  fetchLogs,
};
