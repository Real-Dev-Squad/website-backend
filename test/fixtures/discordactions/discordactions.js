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

const roleDataFromDiscord = {
  roles: [
    {
      id: "test-role-id",
      name: "test-role-name",
    },
    {
      id: "test-role-id1",
      name: "Group 2",
    },
  ],
};

module.exports = {
  groupData,
  roleData,
  existingRole,
  requestRoleData,
  roleDataFromDiscord,
};
