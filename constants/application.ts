const APPLICATION_STATUS_TYPES = {
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  PENDING: "pending",
  CHANGES_REQUESTED: "changes_requested",
};

const APPLICATION_ROLES = {
  DEVELOPER: "developer",
  DESIGNER: "designer",
  PRODUCT_MANAGER: "product_manager",
  PROJECT_MANAGER: "project_manager",
  QA: "qa",
  SOCIAL_MEDIA: "social_media",
};

const API_RESPONSE_MESSAGES = {
  APPLICATION_RETURN_SUCCESS: "Applications returned successfully",
  APPLICATION_CREATED_SUCCESS: "Application created successfully",
  APPLICATION_UPDATED_SUCCESS: "Application updated successfully",
};

const APPLICATION_ERROR_MESSAGES = {
  APPLICATION_ALREADY_REVIEWED: "Application has already been reviewed and cannot be modified",
  APPLICATION_NOT_FOUND: "Application not found",
  INVALID_ROLE: "Invalid role specified",
};

module.exports = {
  APPLICATION_STATUS_TYPES,
  APPLICATION_ROLES,
  API_RESPONSE_MESSAGES,
  APPLICATION_ERROR_MESSAGES,
};
