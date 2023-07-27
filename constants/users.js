const profileStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  NOT_APPROVED: "NOT APPROVED",
};

const USER_SENSITIVE_DATA = ["phone", "email", "chaincode", "tokens"];

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

module.exports = {
  profileStatus,
  USER_STATUS,
  ALLOWED_FILTER_PARAMS,
  USER_SENSITIVE_DATA,
  DOCUMENT_WRITE_SIZE,
};
