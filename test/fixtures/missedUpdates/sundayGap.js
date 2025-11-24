const userData = require("../user/user")();
const tasksData = require("../tasks/tasks")();
const { TASK_STATUS } = require("../../../constants/tasks");

module.exports = () => {
  const developer = {
    ...userData[0],
    username: "sunday-gap-user",
    discordId: "sunday-gap-discord",
    roles: { ...(userData[0].roles || {}), archived: false, in_discord: true },
  };

  const task = {
    ...tasksData[0],
    status: TASK_STATUS.IN_PROGRESS,
    startedOn: Math.floor(Date.UTC(2025, 2, 31) / 1000),
    endsOn: Math.floor(Date.UTC(2025, 4, 30) / 1000),
  };

  return {
    evaluationTime: Date.UTC(2025, 3, 14, 9, 0, 0, 0),
    saturdayProgressTimestamp: Date.UTC(2025, 3, 12, 0, 0, 0, 0),
    developer,
    task,
  };
};
