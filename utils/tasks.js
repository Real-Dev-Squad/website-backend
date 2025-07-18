const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require("./users");
const { TASK_TYPE, MAPPED_TASK_STATUS, COMPLETED_TASK_STATUS, TASK_STATUS } = require("../constants/tasks");
const fireStore = require("../utils/firestore");
const tasksModel = fireStore.collection("tasks");
const { daysOfWeek } = require("../constants/constants");

const fromFirestoreData = async (task) => {
  if (!task) {
    return task;
  }

  let { createdBy, assignee: assigneeId, participants, type } = task;
  let assigneeName;

  if (createdBy) {
    createdBy = await getUsername(createdBy);
  }

  if (assigneeId) {
    assigneeName = await getUsername(assigneeId);
  }

  if (type === TASK_TYPE.GROUP) {
    participants = await getParticipantUsernames(participants);
  }

  const updatedTask = {
    ...task,
    createdBy,
    participants,
  };

  if (assigneeName || assigneeId) {
    updatedTask.assignee = assigneeName;
    updatedTask.assigneeId = assigneeId;
  }

  return updatedTask;
};

const toFirestoreData = async (task) => {
  if (!task) {
    return task;
  }
  const updatedTask = { ...task };
  const { assignee, participants } = task;
  if (assignee) {
    updatedTask.assignee = await getUserId(assignee);
  }

  if (Array.isArray(participants)) {
    updatedTask.participants = await getParticipantUserIds(participants);
  }
  return updatedTask;
};

const buildTasks = (tasks, initialTaskArray = []) => {
  if (!tasks.empty) {
    tasks.forEach((task) => {
      initialTaskArray.push({
        id: task.id,
        ...task.data(),
      });
    });
  }

  return initialTaskArray;
};

const transformQuery = (status = "", size, page, assignee = "", title = "") => {
  const query = {};
  const transformedStatus = MAPPED_TASK_STATUS[status.toUpperCase()];
  const transformedAssignee = assignee.toLowerCase();
  const transformedTitle = title;

  if (page) {
    query.page = Number.parseInt(page);
  }

  if (size) {
    query.size = Number.parseInt(size);
  }

  return {
    status: transformedStatus,
    assignee: transformedAssignee,
    title: transformedTitle,
    ...query,
  };
};

const parseSearchQuery = (queryString) => {
  const searchParams = {};
  const queryParts = queryString.split("+");
  queryParts.forEach((part) => {
    const [key, value] = part.split(":");
    switch (key.toLowerCase()) {
      case "searchterm":
        searchParams.searchTerm = value.toLowerCase();
        break;
      case "assignee":
        searchParams.assignee = value.toLowerCase();
        break;
      case "status":
        searchParams.status = value.toLowerCase();
        break;
      default:
        break;
    }
  });
  return searchParams;
};

const buildTasksQueryForMissedUpdates = (size) => {
  const completedTasksStatusList = Object.values(COMPLETED_TASK_STATUS);
  return tasksModel
    .where("status", "not-in", [...completedTasksStatusList, TASK_STATUS.AVAILABLE])
    .orderBy("status")
    .orderBy("assignee")
    .limit(size);
};

const transformTasksUsersQuery = (queries) => {
  if (!queries) return {};
  const { "days-count": dateGap, weekday, date, status, size } = queries;
  let transformedStatus;
  if (status && status.length === 1 && status[0].value) {
    transformedStatus = status[0].value;
  }
  let transformedSize;
  if (size) {
    transformedSize = Number.parseInt(size);
  }
  let transformedDateGap;
  if (dateGap && dateGap.length === 1) {
    transformedDateGap = Number.parseInt(dateGap[0].value);
  }
  let dateList;
  if (date) {
    dateList = date.map((date) => Number.parseInt(date.value));
  }
  let weekdayList;
  if (weekday) {
    weekdayList = weekday.map((day) => daysOfWeek[day.value]);
  }
  return { dateGap: transformedDateGap, status: transformedStatus, size: transformedSize, weekdayList, dateList };
};

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks,
  transformQuery,
  parseSearchQuery,
  buildTasksQueryForMissedUpdates,
  transformTasksUsersQuery,
};
