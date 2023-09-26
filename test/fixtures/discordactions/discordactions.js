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

const roleDataFromDiscord = [
  {
    id: 'test-role-id',
    role: 'test-role-name'
  }, {
    id: 'test-role-id1',
    role: 'test-role-name1'
  }
]

module.exports = {
  groupData,
  roleData,
  existingRole,
  requestRoleData,
  roleDataFromDiscord
};
