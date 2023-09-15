const profileStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  NOT_APPROVED: "NOT APPROVED",
};

const USER_STATUS = {
  OOO: "ooo",
  IDLE: "idle",
  ACTIVE: "active",
  ONBOARDING: "onboarding",
};

const ALLOWED_FILTER_PARAMS = {
  ITEM_TAG: ["levelId", "levelName", "levelValue", "tagId"],
  USER_STATE: ["state"],
  ROLE: ["role"],
};

const DOCUMENT_WRITE_SIZE = 500;

const FIRESTORE_IN_CLAUSE_SIZE = 30;

const USERS_PATCH_HANDLER_ACTIONS = {
  ARCHIVE_USERS: "archiveUsers",
  NON_VERFIED_DISCORD_USERS: "nonVerifiedDiscordUsers",
};

const USERS_PATCH_HANDLER_ERROR_MESSAGES = {
  VALIDATE_PAYLOAD: "Invalid Payload",
  ARCHIVE_USERS: {
    NO_USERS_DATA_TO_UPDATE: "Couldn't find any users currently inactive in Discord but not archived.",
    BATCH_DATA_UPDATED_FAILED: "Firebase batch operation failed",
  },
};

const USERS_PATCH_HANDLER_SUCCESS_MESSAGES = {
  ARCHIVE_USERS: {
    SUCCESSFULLY_UPDATED_DATA: "Successfully updated users archived role to true if in_discord role is false",
    SUCCESSFULLY_COMPLETED_BATCH_UPDATES: "Successfully completed batch updates",
  },
};
const OVERDUE_TASKS = "overdue_tasks";

module.exports = {
  profileStatus,
  USER_STATUS,
  ALLOWED_FILTER_PARAMS,
  DOCUMENT_WRITE_SIZE,
  FIRESTORE_IN_CLAUSE_SIZE,
  USERS_PATCH_HANDLER_ACTIONS,
  USERS_PATCH_HANDLER_ERROR_MESSAGES,
  USERS_PATCH_HANDLER_SUCCESS_MESSAGES,
  OVERDUE_TASKS,
};
