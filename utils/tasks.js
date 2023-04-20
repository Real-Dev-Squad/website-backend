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

/**
 * @param query: Record<string, string>
 * @returns Record<exclude|type|next_curosr, string> which returns
 * - `{exclude: <string>}` if query only contains key `exclude`
 * - `{type: <string>}` if query only contains key `type`
 * - `{type: <string>, next_cursor: <string>} if query contains key `type` and `next_cursor`
 * - `{ [exclude|type|next_curosr]: <string>}` combination of any other pattern having these keys
 */
function getParsedQueryParams(query) {
  const { q } = query;
  if (isEmpty(q) || typeof q !== "string") return {};
  return q.split(" ").reduce((acc, item) => {
    const [key, value] = item.split(":");
    return { ...acc, [key]: value };
  }, {});
}

/**
 * @param params: Record<exclude|type|cursor, string> of query parameters for building query with filtering logic, using`in` and `not-in` query operators.
 * @returns which returns
 * - `{whereFilterOp: <string>, status: Array<TASK_STATUS>} `if query is not paginated query
 * - `{whereFilterOp: <string>, status: Array<TASK_STATUS>, cursor: string}` if query is paginated query
 */
function getFetchTasksQueryParameters(params) {
  if (isEmpty(params)) {
    return {};
  }
  const queryParams = getParsedQueryParams(params);
  if (isEmpty(queryParams)) return {};
  const { exclude, type, cursor } = queryParams;
  if ((exclude && cursor) || (exclude && type) || (cursor && !type)) return {};
  const statuses = exclude ? exclude.split(",") : [type.split(",")[0]];
  const taskStatusKeys = Object.entries(TASK_STATUS)
    .filter(([_, value]) => statuses.includes(value))
    .map(([key, _]) => key.toLowerCase());
  const whereFilterOp = exclude ? "not-in" : "in";
  return {
    whereFilterOp,
    status: taskStatusKeys,
    ...(!isEmpty(cursor) ? { cursor } : {}),
  };
}

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks,
  getFetchTasksQueryParameters,
};
