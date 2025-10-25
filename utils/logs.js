const admin = require("firebase-admin");
const { logType } = require("../constants/logs");
const usersService = require("../services/dataAccessLayer");
const firestore = require("./firestore");
const tasksModel = firestore.collection("tasks");
const { _ } = require("lodash");
async function getUsersListFromLogs(allLogs) {
  const userIds = new Set();
  for (const log of allLogs) {
    if (!userIds.has(log.meta.userId || log.meta.createdBy)) {
      userIds.add(log.meta.userId || log.meta.createdBy);
    }
  }
  return await usersService.fetchUsersForKeyValues(admin.firestore.FieldPath.documentId(), Array.from(userIds));
}

async function getTasksFromLogs(allLogs) {
  const taskDetails = [];
  const taskIds = new Set();
  for (const log of allLogs) {
    if (!taskIds.has(log.meta?.taskId || log.body?.taskId)) {
      taskIds.add(log.meta?.taskId || log.body?.taskId);
    }
  }
  if (Array.from(taskIds).filter((e) => e).length !== 0) {
    const data = await tasksModel
      .where(
        admin.firestore.FieldPath.documentId(),
        "in",
        Array.from(taskIds).filter((e) => e)
      )
      .get();
    data.forEach((doc) => {
      taskDetails.push({
        id: doc.id,
        ...doc.data(),
      });
    });
  }
  return taskDetails;
}

function formatLogsForFeed(logs, usersMap, tasksMap) {
  switch (logs.type) {
    case logType.EXTENSION_REQUESTS:
      return formatExtensionRequestsLog(logs, usersMap, tasksMap);
    case logType.REQUEST_CREATED:
    case logType.REQUEST_APPROVED:
    case logType.REQUEST_REJECTED:
      return formatOOORequestLogs(logs, usersMap, logType.type);
    case logType.TASK:
      return formatTaskUpdateLogs(logs, usersMap, tasksMap);
    case logType.PROFILE_DIFF_APPROVED:
    case logType.PROFILE_DIFF_REJECTED:
      return formatProfileDiffLogs(logs, usersMap, logs.type);
    case logType.TASK_REQUESTS:
      return formatTaskRequestsLogs(logs, usersMap, tasksMap);
    default:
      return {};
  }
}

function formatOOORequestLogs(logsSnapshot, usersMap, type) {
  const { meta, body } = logsSnapshot;
  switch (logsSnapshot.body.type) {
    case "OOO":
      return {
        user: usersMap[body.requestedBy]?.username,
        requestId: meta.requestId,
        from: body.from,
        until: body.until,
        message: body.message,
      };
    default:
      return {};
  }
}
function formatExtensionRequestsLog(logsSnapshot, usersMap, tasksMap) {
  const { meta } = logsSnapshot;
  return {
    user:
      usersMap[logsSnapshot.meta.userId]?.username ??
      usersMap[logsSnapshot.meta.createdBy]?.username ??
      logsSnapshot.body.username,
    taskId: meta.taskId,
    taskTitle: tasksMap[logsSnapshot.meta.taskId]?.title ?? "Untitled Task",
    ...flattenObject(logsSnapshot),
  };
}

function formatTaskUpdateLogs(logsSnapshot, usersMap, tasksMap) {
  const { meta } = logsSnapshot;
  return {
    user: logsSnapshot.meta.username ?? usersMap[meta.userId]?.username,
    taskId: meta.taskId,
    taskTitle: tasksMap[meta.taskId]?.title,
    ...flattenObject(logsSnapshot),
  };
}

function formatProfileDiffLogs(logsSnapshot, usersMap, type) {
  const { meta, body } = logsSnapshot;
  const actionKey = type === logType.PROFILE_DIFF_APPROVED ? "approvedBy" : "rejectedBy";
  return {
    user: usersMap[meta.userId]?.username,
    message: body.message,
    // eslint-disable-next-line security/detect-object-injection
    [actionKey]: usersMap[meta[actionKey]]?.username,
  };
}

function formatTaskRequestsLogs(logsSnapshot, usersMap, tasksMap) {
  const { meta, body } = logsSnapshot;
  const formattedData = flattenObject(logsSnapshot);
  return {
    user: usersMap[meta.lastModifiedBy]?.username,
    taskId: meta.taskId,
    taskTitle: tasksMap[body.taskId]?.title,
    proposedStartDate: formattedData.users[0].proposedStartDate,
    proposedDeadline: formattedData.users[0].proposedDeadline,
    ..._.omit(formattedData, "users"),
  };
}

function flattenObject(obj, prefix = "") {
  const result = Object.create(null);

  if (!obj || typeof obj !== "object") return result;

  for (const [key, value] of Object.entries(obj)) {
    if (key === "timestamp") continue;

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const nested = flattenObject(value, prefix);
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        Reflect.defineProperty(result, nestedKey, {
          value: nestedValue,
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
    } else {
      Reflect.defineProperty(result, key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }

  return result;
}

function mapify(array, key) {
  const mappifiedObj = {};
  array.forEach((element) => {
    // eslint-disable-next-line security/detect-object-injection
    mappifiedObj[element[key]] = element;
  });
  return mappifiedObj;
}

function convertTimestamp(timestamp) {
  const seconds = timestamp._seconds;
  const nanoseconds = timestamp._nanoseconds;

  return seconds + Math.floor(nanoseconds / 10000000);
}

module.exports = {
  mapify,
  convertTimestamp,
  getTasksFromLogs,
  formatLogsForFeed,
  getUsersListFromLogs,
};
