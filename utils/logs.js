const admin = require("firebase-admin");
const { logType } = require("../constants/logs");
const usersService = require("../services/dataAccessLayer");
const { EXTENSION_REQUEST_STATUS } = require("../constants/extensionRequests");

async function getUsersListFromLogs(allLogs) {
  const userIds = new Set();
  for (const log of allLogs) {
    if (!userIds.has(log.meta.userId || log.meta.createdBy)) {
      userIds.add(log.meta.userId || log.meta.createdBy);
    }
  }
  return await usersService.fetchUsersForKeyValues(admin.firestore.FieldPath.documentId(), Array.from(userIds));
}

function formatLogsForFeed(logs, usersMap) {
  switch (logs.type) {
    case logType.EXTENSION_REQUESTS:
      return formatExtensionRequestsLog(logs, usersMap);
    case logType.REQUEST_CREATED:
      return formatRequestCreatedLogs(logs, usersMap);
    case logType.TASK:
      return formatTaskUpdateLogs(logs, usersMap);
    case logType.PROFILE_DIFF_APPROVED:
    case logType.PROFILE_DIFF_REJECTED:
      return formatProfileDiffLogs(logs, usersMap, logs.type);
    default:
      return {};
  }
}

function formatRequestCreatedLogs(logsSnapshot, usersMap) {
  const { meta, body } = logsSnapshot;
  switch (logsSnapshot.body.type) {
    case "OOO":
      return {
        user: usersMap[body.requestedBy]?.username,
        requestId: meta.requestId,
        from: body.from,
        until: body.until,
        message: body.message,
        taskId: meta.taskId,
        extensionRequestId: body.extensionRequestId,
      };
    default:
      return {};
  }
}
function formatExtensionRequestsLog(logsSnapshot, usersMap) {
  const { meta, body } = logsSnapshot;
  const formattedLog = {
    user: logsSnapshot.meta.username ?? usersMap[logsSnapshot.meta.userId]?.username,
    taskId: meta.taskId,
    extensionRequestId: body.extensionRequestId,
    status: body.status,
  };

  if (body.status === EXTENSION_REQUEST_STATUS.PENDING) {
    formattedLog.user = logsSnapshot.meta.username ?? usersMap[logsSnapshot.meta.assignee]?.username;
    formattedLog.newEndsOn = body.newEndsOn;
    formattedLog.oldEndsOn = body.oldEndsOn;
  }

  return formattedLog;
}

function formatTaskUpdateLogs(logsSnapshot, usersMap) {
  const { meta, body } = logsSnapshot;
  switch (logsSnapshot.body.subType) {
    case "update":
      return {
        user: usersMap[meta.userId]?.username,
        taskId: meta.taskId,
        percentCompleted: body.new?.percentCompleted ?? "",
        status: body.new?.status ?? "",
        endsOn: body.new?.endsOn ?? "",
      };
    default:
      return {};
  }
}

function formatProfileDiffLogs(logsSnapshot, usersMap, type) {
  const { meta } = logsSnapshot;
  const actionKey = type === logType.PROFILE_DIFF_APPROVED ? "approvedBy" : "rejectedBy";
  return {
    user: usersMap[meta.userId]?.username,
    // eslint-disable-next-line security/detect-object-injection
    actionKey: usersMap[meta[actionKey]]?.username,
  };
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
  convertTimestamp,
  getUsersListFromLogs,
  formatLogsForFeed,
  mapify,
};
