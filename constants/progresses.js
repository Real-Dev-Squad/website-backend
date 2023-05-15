const PROGRESS_DOCUMENT_CREATED_SUCCEEDED = "Progress document created successfully.";
const PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED = "Progress document retrieved successfully.";
const PROGRESS_DOCUMENT_NOT_FOUND = "No progress records found.";
const PROGRESS_ALREADY_CREATED = "Progress for the day has already been created.";
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const INTERNAL_SERVER_ERROR_MESSAGE =
  "The server has encountered an unexpected error. Please contact the administrator for more information.";

const RESPONSE_MESSAGES = {
  PROGRESS_DOCUMENT_CREATED_SUCCEEDED,
  PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
  PROGRESS_DOCUMENT_NOT_FOUND,
  PROGRESS_ALREADY_CREATED,
};

const TYPE_MAP = {
  user: "userId",
  task: "taskId",
};

module.exports = { RESPONSE_MESSAGES, MILLISECONDS_IN_DAY, INTERNAL_SERVER_ERROR_MESSAGE, TYPE_MAP };
