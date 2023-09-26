const groupData = [
  { rolename: "Group 1", roleid: 1 },
  { rolename: "Group 2", roleid: 2 },
  { rolename: "Group 3", roleid: 3 },
];

const roleData = {
  roleid: "test-role-id",
  userid: "test-user-id",
};

const requestRoleData = {
  rolename: "test-role",
};

const existingRole = {
  roleData: { roleid: "test-role-id", userid: "test-user-id" },
  wasSuccess: false,
};

const groupOnboarding31dPlus = { rolename: "group-onboarding-31d+", roleid: 5, createdBy: "1dad23q23j131j" };

module.exports = {
  groupData,
  roleData,
  existingRole,
  requestRoleData,
  groupOnboarding31dPlus,
};
