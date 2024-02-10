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
  ALL: "ALL",
};

export const REQUEST_LOG_TYPE = {
  REQUEST_CREATED: "REQUEST_CREATED",
  REQUEST_APPROVED: "REQUEST_APPROVED",
  REQUEST_REJECTED: "REQUEST_REJECTED",
  REQUEST_BLOCKED: "REQUEST_BLOCKED",
  REQUEST_CANCELLED: "REQUEST_CANCELLED",
};

export const REQUEST_CREATED_SUCCESSFULLY = "Request created successfully";
export const REQUEST_UPDATED_SUCCESSFULLY = "Request updated successfully";
export const REQUEST_FETCHED_SUCCESSFULLY = "Request fetched successfully";
export const REQUEST_ALREADY_APPROVED = "Request already approved";
export const REQUEST_ALREADY_REJECTED = "Request already rejected";

export const ERROR_WHILE_FETCHING_REQUEST = "Error while fetching request";
export const ERROR_WHILE_CREATING_REQUEST = "Error while creating request";
export const ERROR_WHILE_UPDATING_REQUEST = "Error while updating request";

export const REQUEST_DOES_NOT_EXIST = "Request does not exist";
export const REQUEST_ALREADY_PENDING = "Request already exists please wait for approval or rejection";
