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
  NUDGE_SUCCESS: "Nudge sent successfully",
  FEEDBACK_SUBMITTED_SUCCESS: "Application feedback submitted successfully",
};

const APPLICATION_ERROR_MESSAGES = {
  APPLICATION_ALREADY_REVIEWED: "Application has already been reviewed",
  NUDGE_TOO_SOON: "Nudge unavailable. You'll be able to nudge again after 24 hours.",
  NUDGE_ONLY_PENDING_ALLOWED: "Nudge unavailable. Only pending applications can be nudged.",
};

const APPLICATION_LOG_MESSAGES = {
  ERROR_SUBMITTING_FEEDBACK: "Error while submitting the application feedback",
};

const APPLICATION_STATUS = {
  notFound: "notFound",
  unauthorized: "unauthorized",
  notPending: "notPending",
  tooSoon: "tooSoon",
  success: "success",
} as const;

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
  APPLICATION_LOG_MESSAGES,
  APPLICATION_REVIEW_CYCLE_START_DATE,
  APPLICATION_STATUS
};
