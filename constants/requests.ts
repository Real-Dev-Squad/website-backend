export const REQUEST_STATE = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

export const LOG_ACTION = {
  CREATE: "create",
  ERRORS: "errors",
  UPDATE: "update",
};

export const REQUEST_TYPE = {
  OOO: "OOO",
  EXTENSION: "EXTENSION",
  TASK: "TASK",
  ALL: "ALL",
  ONBOARDING: "ONBOARDING",
};

export const REQUEST_LOG_TYPE = {
  REQUEST_CREATED: "REQUEST_CREATED",
  REQUEST_APPROVED: "REQUEST_APPROVED",
  REQUEST_REJECTED: "REQUEST_REJECTED",
  REQUEST_BLOCKED: "REQUEST_BLOCKED",
  REQUEST_CANCELLED: "REQUEST_CANCELLED",
};

export const REQUEST_CREATED_SUCCESSFULLY = "Request created successfully";
export const REQUEST_APPROVED_SUCCESSFULLY = "Request approved successfully";
export const REQUEST_REJECTED_SUCCESSFULLY = "Request rejected successfully";
export const REQUEST_FETCHED_SUCCESSFULLY = "Request fetched successfully";

export const REQUEST_ALREADY_APPROVED = "Request already approved";
export const REQUEST_ALREADY_REJECTED = "Request already rejected";

export const ERROR_WHILE_FETCHING_REQUEST = "Error while fetching request";
export const ERROR_WHILE_CREATING_REQUEST = "Error while creating request";
export const ERROR_WHILE_UPDATING_REQUEST = "Error while updating request";

export const REQUEST_DOES_NOT_EXIST = "Request does not exist";
export const REQUEST_ALREADY_PENDING = "Request already exists please wait for approval or rejection";

export const TASK_REQUEST_MESSAGES = {
  NOT_AUTHORIZED_TO_CREATE_REQUEST: "Not authorized to create the request",
  USER_NOT_FOUND: "User not found",
  TASK_NOT_EXIST: "Task does not exist",
  INVALID_EXTERNAL_ISSUE_URL: "External issue url is not valid",
  ISSUE_NOT_EXIST: "Issue does not exist",
  TASK_REQUEST_EXISTS: "Task request already exists",
  TASK_EXISTS_FOR_GIVEN_ISSUE: "Task exists for the given issue.",
  TASK_ALREADY_REQUESTED: "Task was already requested",
  TASK_REQUEST_CREATED_SUCCESS: "Task request created successfully",
  ERROR_CREATING_TASK_REQUEST: "Error while creating task request",
  TASK_REQUEST_UPDATED_SUCCESS: "Task request updated successfully",
};
