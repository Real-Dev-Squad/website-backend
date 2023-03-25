const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require("./users");
const { TASK_TYPE, TASK_STATUS } = require("../constants/tasks");
const { isEmpty } = require("./helpers");

const fromFirestoreData = async (task) => {
  if (!task) {
    return task;
  }

  let { createdBy, assignee, participants, type } = task;

  if (createdBy) {
    createdBy = await getUsername(createdBy);
  }

  if (assignee) {
    assignee = await getUsername(assignee);
  }

  if (type === TASK_TYPE.GROUP) {
    participants = await getParticipantUsernames(participants);
  }

  return {
    ...task,
    createdBy,
    assignee,
    participants,
  };
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

// TODO: simplify meaning of returns
/**
 * @param query: Record<string, string>
 * @returns Record<filter|type|next_curosr, string> of query parameters for building query with filtering logic, using`in` and `not-in` query operators.
 */
function getFetchTasksQueryParameters(query) {
  const q = query.q;
  if (!q || isEmpty(q) || typeof q !== "string") return {};
  return q.split(" ").reduce((acc, item) => {
    const [key, value] = item.split(":");
    return { ...acc, [key]: value };
  }, {});
}

// TODO: simplify meaning of returns
// TODO: simplify the function logic
// TODO: add check if filter or type is missing
/**
 * @param tasksModel: CollectionReference<DocumentData> it contains tasksModel collection refference
 * @param requestQueryParams: Record<filter|type|next_curosr, string> of query parameters for building query with filtering logic, using`in` and `not-in` query operators.
 * @returns query for fetch tasks which may or may not have filtering logic/operators
 */
function getFetchTasksQuery(tasksModel, requestQueryParams) {
  // TODO: use constant for error messages
  if (isEmpty(tasksModel)) {
    throw Error("TasksModel is Empty");
  }
  const queryParams = getFetchTasksQueryParameters(requestQueryParams);
  if (isEmpty(queryParams)) return tasksModel;
  const { filter, type, next_cursor: nextCursor } = queryParams;
  if ((filter && nextCursor) || (filter && type) || nextCursor) return tasksModel;
  const status = filter ?? type;
  const possibleEntries = Object.entries(TASK_STATUS).filter(([_, value]) => value === status);
  const possibleKeys = possibleEntries.map(([key, _]) => key.toLowerCase());
  // TODO: add support for mutliple filters
  if (filter) {
    return tasksModel.where("status", "not-in", possibleKeys);
  }
  return tasksModel.where("status", "in", possibleKeys);
}

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks,
  getFetchTasksQuery,
};
