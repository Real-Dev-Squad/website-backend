export const PROGRESS_DOCUMENT_CREATED_SUCCEEDED = "Progress document created successfully.";
export const PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED = "Progress document retrieved successfully.";
export const PROGRESS_DOCUMENT_NOT_FOUND = "No progress records found.";
export const PROGRESS_ALREADY_CREATED = "Progress for the day has already been created.";
export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
export const INTERNAL_SERVER_ERROR_MESSAGE =
  "The server has encountered an unexpected error. Please contact the administrator for more information.";

export const PROGRESSES_RESPONSE_MESSAGES = {
  PROGRESS_DOCUMENT_CREATED_SUCCEEDED,
  PROGRESS_DOCUMENT_RETRIEVAL_SUCCEEDED,
  PROGRESS_DOCUMENT_NOT_FOUND,
  PROGRESS_ALREADY_CREATED,
};

export const TYPE_MAP = { user: "userId", task: "taskId" };
export const PROGRESS_VALID_SORT_FIELDS = ["date", "-date"];
export const PROGRESSES_SIZE = 20;
export const PROGRESSES_PAGE_SIZE = 0;
export const VALID_PROGRESS_TYPES = ["task", "user"];

export const UNAUTHORIZED_WRITE = "Unauthorized to write progress of task";
