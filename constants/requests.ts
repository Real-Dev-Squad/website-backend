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
  REQUEST_UPDATED: "REQUEST_UPDATED",
  PENDING_REQUEST_FOUND: "PENDING_REQUEST_FOUND",
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
export const ERROR_WHILE_ACKNOWLEDGING_REQUEST = "Error while acknowledging request";

export const REQUEST_ID_REQUIRED = "Request id is required";
export const REQUEST_DOES_NOT_EXIST = "Request does not exist";
export const REQUEST_ALREADY_PENDING = "Request already exists please wait for approval or rejection";
export const UNAUTHORIZED_TO_CREATE_OOO_REQUEST = "Unauthorized to create OOO request";
export const USER_STATUS_NOT_FOUND = "User status not found";
export const OOO_STATUS_ALREADY_EXIST = "Your status is already OOO. Please cancel OOO to raise new one";

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

export const ONBOARDING_REQUEST_CREATED_SUCCESSFULLY = "Onboarding extension request created successfully"
export const UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST = "Only super user and onboarding user are authorized to create an onboarding extension request"

export const PENDING_REQUEST_UPDATED = "Only pending extension request can be updated";
export const INVALID_REQUEST_TYPE = "Invalid request type";
export const INVALID_REQUEST_DEADLINE = "New deadline of the request must be greater than old deadline";
export const REQUEST_UPDATED_SUCCESSFULLY = "Request updated successfully";
export const UNAUTHORIZED_TO_UPDATE_REQUEST = "Unauthorized to update request";

export const FEATURE_NOT_IMPLEMENTED = "Feature not implemented";

export const INVALID_ACTION_PARAM = "Invalid 'action' parameter: must be either 'START' or 'STOP'";

export const OPERATION_NOT_ALLOWED = "You are not allowed for this operation at the moment";

export const IMPERSONATION_LOG_TYPE = {
  SESSION_STARTED:"SESSION_STARTED",
  SESSION_STOPPED:"SESSION_STOPPED"
}