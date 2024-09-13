const groupData = [
  { rolename: "Group 1", roleid: "1" },
  { rolename: "Group 2", roleid: "2" },
  { rolename: "Group 3", roleid: "3" },
  { rolename: "admin", roleid: "4" },
  { rolename: "group-test", roleid: "5" },
];

const groupIdle7d = { rolename: "group-idle-7d+", roleid: 4, createdBy: "1dad23q23j131j" };

const groupIdle = { rolename: "group-idle", roleid: 3, createdBy: "1dad23q23j131j" };

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

const memberGroupData = [
  { roleid: "1234", userid: "12356" },
  { roleid: "12567", userid: "12367" },
  { roleid: "12564", userid: "12350" },
];

const groupOnboarding31dPlus = {
  rolename: "group-onboarding-31d+",
  roleid: "11334336",
  createdBy: "1dad23q23j131j",
};

module.exports = {
  groupData,
  roleData,
  memberGroupData,
  existingRole,
  requestRoleData,
  groupIdle7d,
  roleDataFromDiscord,
  groupOnboarding31dPlus,
  groupIdle,
};
