const groupData = [
  { id: "1", name: "Group 1" },
  { id: "2", name: "Group 2" },
  { id: "3", name: "Group 3" },
];

const roleData = {
  roleid: "test-role-id",
  userid: "test-user-id",
};

const existingRole = {
  roleData: { roleid: "test-role-id", userid: "test-user-id" },
  wasSuccess: false,
};

module.exports = {
  groupData,
  roleData,
  existingRole,
};
