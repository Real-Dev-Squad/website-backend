const TASK_TYPE = {
  FEATURE: "feature",
  GROUP: "group",
  STORY: "story",
};

const TASK_STATUS = {
  UNASSIGNED: "UNASSIGNED",
  ASSIGNED: "ASSIGNED",
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED: "BLOCKED",
  SMOKE_TESTING: "SMOKE_TESTING",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  MERGED: "MERGED",
  SANITY_CHECK: "SANITY_CHECK",
  REGRESSION_CHECK: "REGRESSION_CHECK",
  RELEASED: "RELEASED",
  VERIFIED: "VERIFIED",
  DONE: "DONE",
};

// TODO: convert this to new task status
const TASK_STATUS_OLD = {
  OLD_ACTIVE: "active",
  OLD_BLOCKED: "blocked",
  OLD_PENDING: "pending",
  OLD_COMPLETED: "completed",
};

module.exports = { TASK_TYPE, TASK_STATUS, TASK_STATUS_OLD };
