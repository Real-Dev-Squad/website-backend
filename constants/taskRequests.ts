const TASK_REQUEST_STATUS = {
  WAITING: "WAITING",
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  DENIED: "DENIED",
};
const TASK_REQUEST_ERROR_MESSAGE = {
  INVALID_PREV: "Invalid 'prev' value",
  INVALID_NEXT: "Invalid 'next' value",
};
const TASK_REQUEST_TYPE = {
  ASSIGNMENT: "ASSIGNMENT",
  CREATION: "CREATION",
};
const TASK_REQUEST_FILTER_KEYS = {
  status: "status",
  "request-type": "requestType",
};
const TASK_REQUEST_FILTER_VALUES = {
  pending: "PENDING",
  approved: "APPROVED",
  denied: "DENIED",
  assignment: "ASSIGNMENT",
  creation: "CREATION",
};
const TASK_REQUEST_SORT_KEYS = {
  created: "createdAt",
  requestors: "usersCount",
};
const TASK_REQUEST_SORT_VALUES = {
  asc: "asc",
  desc: "desc",
};
const MIGRATION_TYPE = {
  ADD_NEW_FIELDS: "add-new-fields",
  REMOVE_OLD_FIELDS: "remove-redundant-fields",
};

module.exports = {
  TASK_REQUEST_STATUS,
  TASK_REQUEST_TYPE,
  TASK_REQUEST_FILTER_KEYS,
  TASK_REQUEST_FILTER_VALUES,
  TASK_REQUEST_SORT_KEYS,
  TASK_REQUEST_ERROR_MESSAGE,
  TASK_REQUEST_SORT_VALUES,
  MIGRATION_TYPE
};