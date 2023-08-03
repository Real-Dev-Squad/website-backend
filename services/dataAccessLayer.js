const userQuery = require("../models/users");
const members = require("../models/members");
const { USER_SENSITIVE_DATA } = require("../constants/users");
const AccessLevel = {
  PUBLIC: "public",
  INTERNAL: "internal",
  PRIVATE: "private",
  CONFIDENTIAL: "confidential",
};

const retrieveUsers = async ({
  id = null,
  username = null,
  usernames = null,
  query = null,
  userdata,
  level = AccessLevel.PUBLIC,
  role = null,
}) => {
  if (id || username) {
    let result;
    if (id != null) {
      result = await userQuery.fetchUser({ userId: id });
    } else {
      result = await userQuery.fetchUser({ username: username });
    }
    const user = levelSpecificAccess(result.user, level, role);
    result.user = user;
    return result;
  } else if (usernames) {
    const { users } = await userQuery.fetchUsers(usernames);
    const result = [];
    users.forEach((element) => {
      const user = levelSpecificAccess(element, level, role);
      result.push(user);
    });
    return result;
  } else if (query) {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
    const users = [];
    allUsers.forEach((element) => {
      const user = levelSpecificAccess(element, level, role);
      users.push(user);
    });
    return { users, nextId, prevId };
  } else {
    const result = await userQuery.fetchUser({ userId: userdata.id });
    return levelSpecificAccess(result.user, level, role);
  }
};

const retrieveDiscordUsers = async (level = AccessLevel.PUBLIC, role = null) => {
  const users = await userQuery.getDiscordUsers();
  const userdata = [];
  users.forEach((element) => {
    const user = levelSpecificAccess(element, level, role);
    userdata.push(user);
  });
  return userdata;
};

const retreiveFilteredUsers = async (query) => {
  const users = await userQuery.getUsersBasedOnFilter(query);
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
};

const retrieveMembers = async (query) => {
  const allUsers = await members.fetchUsers(query);
  allUsers.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return allUsers;
};

const retrieveUsersWithRole = async (role) => {
  const users = await members.fetchUsersWithRole(role);
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
};

const removeSensitiveInfo = function (obj) {
  for (let i = 0; i < USER_SENSITIVE_DATA.length; i++) {
    if (Object.prototype.hasOwnProperty.call(obj, USER_SENSITIVE_DATA[i])) {
      delete obj[USER_SENSITIVE_DATA[i]];
    }
  }
};

const privilegedAccess = (user, data, level) => {
  user.email = data.email;
  if (level === AccessLevel.PRIVATE || level === AccessLevel.CONFIDENTIAL) {
    user.phone = data.phone;
  }
  if (level === AccessLevel.CONFIDENTIAL) {
    user.chaincode = data.chaincode;
  }
  return user;
};

const levelSpecificAccess = (user, level = AccessLevel.PUBLIC, role = null) => {
  const unFilteredData = JSON.parse(JSON.stringify(user));
  removeSensitiveInfo(user);
  if (level === AccessLevel.PUBLIC) {
    return user;
  }
  if (!role.super_user) {
    return "unauthorized";
  }
  return privilegedAccess(user, unFilteredData, level);
};

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole,
  retreiveFilteredUsers,
  privilegedAccess,
  levelSpecificAccess,
  AccessLevel,
};
