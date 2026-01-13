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
  APPLICATION_CREATED_SUCCESS: "Application created successfully",
  APPLICATION_RETURN_SUCCESS: "Applications returned successfully",
};

const APPLICATION_ERROR_MESSAGES = {
  APPLICATION_ALREADY_REVIEWED: "Application has already been reviewed",
};

/**
 * Business requirement: Applications created after this date are considered reviewed
 * and cannot be resubmitted. This date marks the start of the new application review cycle.
 */
const APPLICATION_REVIEW_CYCLE_START_DATE = new Date("2026-01-01T00:00:00.000Z");

module.exports = {
  APPLICATION_STATUS_TYPES,
  APPLICATION_ROLES,
  API_RESPONSE_MESSAGES,
  APPLICATION_ERROR_MESSAGES,
  APPLICATION_REVIEW_CYCLE_START_DATE,
};
