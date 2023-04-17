const { updateTaskMessageLogger } = require("../constants/logBuilder");
const { getUsername } = require("../utils/users");

async function taskLogBuilder(taskLog) {
  try {
    const username = await getUsername(taskLog.meta.userId);
    const timestamp = taskLog.timestamp.toDate().getTime() / 1000;
    let messageLog = "";
    if (taskLog.body.subType === "update") {
      messageLog = updateTaskMessageLogger(
        username,
        Object.keys(taskLog.body.new),
        Object.values(taskLog.body.new),
        timestamp
      );
    }
    return messageLog;
  } catch (err) {
    logger.error("Error in creating log message", err);
    throw err;
  }
}

function logMessageBuilder(log) {
  if (!log.type) return "";
  switch (log.type) {
    case "task":
      return taskLogBuilder(log);
    default:
      return "";
  }
}

module.exports = { logMessageBuilder };
