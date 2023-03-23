const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require("./users");
const { TASK_TYPE } = require("../constants/tasks");

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
/**
 * @param tasksModel: CollectionReference<DocumentData> it contains tasksModel collection refference
 * @param requestQueryParams: Record<filter|type|next_curosr, string> of query parameters for building query with filtering logic, using`in` and `not-in` query operators.
 * @returns query for fetch tasks which may or may not have filtering logic/operators
 */
function getFetchTasksQuery(tasksModel, requestQueryParams) {
  const queryParams = getFetchTasksQueryParameters(requestQueryParams);
  if (isEmpty(queryParams)) return tasksModel.get();
  const { filter, type, next_cursor: nextCursor } = queryParams;
  if ((filter && nextCursor) || (filter && type) || nextCursor) return tasksModel.get();
  if (filter) {
    const status = filter.toLowerCase();
    return tasksModel.where("status", "not-in", [status]).get();
  }
  const status = type.toLowerCase();
  return tasksModel.where("status", "in", [status]).get();
}

// TODO: make it global util function
// TODO: write complete logic for all types
// TODO: move it to it's right place
function isEmpty(value) {
  if (typeof value === "string") {
    return value.trim().length === 0 || value.length === 0;
  }
  return false;
}

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks,
  getFetchTasksQuery,
};
