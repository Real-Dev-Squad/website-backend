const PROGRESS_DOCUMENT_CREATED_SUCCEEDED = "Progress document created successfully.";
const PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED = "Progress document retrieved successfully.";
const PROGRESS_DOCUMENT_NOT_FOUND = "No progress records found.";
const PROGRESS_ALREADY_CREATED = "Progress for the day has already been created.";
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const INTERNAL_SERVER_ERROR_MESSAGE =
  "The server has encountered an unexpected error. Please contact the administrator for more information.";

const PROGRESSES_RESPONSE_MESSAGES = {
  PROGRESS_DOCUMENT_CREATED_SUCCEEDED,
  PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
  PROGRESS_DOCUMENT_NOT_FOUND,
  PROGRESS_ALREADY_CREATED,
};

const TYPE_MAP = {
  user: "userId",
  task: "taskId",
};
const PROGRESS_VALID_SORT_FIELDS = ["date", "-date"];
const PROGRESSES_SIZE = 20;
const PROGRESSES_PAGE_SIZE = 0;
const VALID_PROGRESS_TYPES = ["task", "user"];

const UNAUTHORIZED_WRITE = "Unauthorized to write progress of task";

module.exports = {
  PROGRESSES_RESPONSE_MESSAGES,
  MILLISECONDS_IN_DAY,
  INTERNAL_SERVER_ERROR_MESSAGE,
  TYPE_MAP,
  VALID_PROGRESS_TYPES,
  PROGRESS_VALID_SORT_FIELDS,
  PROGRESSES_SIZE,
  PROGRESSES_PAGE_SIZE,
  UNAUTHORIZED_WRITE,
};
