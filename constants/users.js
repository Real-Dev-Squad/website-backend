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

module.exports = {
  profileStatus,
  USER_STATUS,
  ALLOWED_FILTER_PARAMS,
};
