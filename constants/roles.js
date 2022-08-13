// Use Legacy Roles with authorizeUsers middleware
const LEGACY_ROLES = {
  SUPER_USER: "superUser",
  APP_OWNER: "appOwner",
};

// Use Roles with authorizeRoles middleware
const ROLES = { SUPERUSER: "super_user", APPOWNER: "app_owner", MEMBER: "member", ARCHIVED: "archived" };

module.exports = { LEGACY_ROLES, ROLES };
