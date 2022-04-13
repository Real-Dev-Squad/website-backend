const userStatusEnum = ["ooo", "idle", "active"];
const ROLES = {
  ADMIN: "admin",
  APPOWNER: "app_owner",
  DEFAULT: "default",
  MEMBER: "member",
  SUPERUSER: "super_user",
};
const profileStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  NOT_APPROVED: "NOT APPROVED",
};
module.exports = { userStatusEnum, ROLES, profileStatus };
