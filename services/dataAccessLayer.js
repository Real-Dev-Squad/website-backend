const userQuery = require("../models/users");
const members = require("../models/members");
const { ROLE_LEVEL, KEYS_NOT_ALLOWED, ACCESS_LEVEL } = require("../constants/userDataLevels");

const retrieveUsers = async ({
  discordId = null,
  id = null,
  username = null,
  usernames = null,
  query = null,
  userdata,
  level = ACCESS_LEVEL.PUBLIC,
  role = null,
  userIds = null,
}) => {
  let result = {};
  if (id || username) {
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
    users.forEach((userdata) => {
      const user = levelSpecificAccess(userdata, level, role);
      result.push(user);
    });
    return result;
  } else if (userIds) {
    if (userIds.length === 0) {
      return {};
    }
    const userDetails = await userQuery.fetchUserByIds(userIds);
    Object.keys(userDetails).forEach((userId) => {
      removeSensitiveInfo(userDetails[userId]);
    });
    return userDetails;
  } else if (query) {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
    const users = [];
    allUsers.forEach((userdata) => {
      const user = levelSpecificAccess(userdata, level, role);
      users.push(user);
    });
    return { users, nextId, prevId };
  } else if (discordId !== null) {
    result = await userQuery.fetchUser({ discordId });
    return result;
  } else {
    const result = await userQuery.fetchUser({ userId: userdata.id });
    return levelSpecificAccess(result.user, level, role);
  }
};

const retrieveDiscordUsers = async (level = ACCESS_LEVEL.PUBLIC, role = null) => {
  const users = await userQuery.getDiscordUsers();
  const usersData = [];
  users.forEach((userdata) => {
    const user = levelSpecificAccess(userdata, level, role);
    usersData.push(user);
  });
  return usersData;
};

const retreiveFilteredUsers = async (query) => {
  const users = await userQuery.getUsersBasedOnFilter(query);
  users.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return users;
};

const retrieveMembers = async (query) => {
  const allUsers = await members.fetchUsers(query);
  allUsers.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return allUsers;
};

const retrieveUsersWithRole = async (role) => {
  const users = await members.fetchUsersWithRole(role);
  users.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return users;
};

const removeSensitiveInfo = function (obj, level = ACCESS_LEVEL.PUBLIC) {
  for (let i = 0; i < KEYS_NOT_ALLOWED[level].length; i++) {
    if (Object.prototype.hasOwnProperty.call(obj, KEYS_NOT_ALLOWED[level][i])) {
      delete obj[KEYS_NOT_ALLOWED[level][i]];
    }
  }
};

const levelSpecificAccess = (user, level = ACCESS_LEVEL.PUBLIC, role = null) => {
  if (level === ACCESS_LEVEL.PUBLIC || ROLE_LEVEL[level].includes(role)) {
    removeSensitiveInfo(user, level);
    return user;
  }
  return "unauthorized";
};

/**
 * Fetch users based on document key and value
 * @param documentKey {String} -  Model field path.
 * @param value {String | Array} - Single field value or list of values to be matched.
 */
const fetchUsersForKeyValues = async (documentKey, value, removeSensitiveInfo = true) => {
  let userList;
  if (Array.isArray(value)) {
    userList = await userQuery.fetchUsersListForMultipleValues(documentKey, value);
  } else {
    userList = await userQuery.fetchUserForKeyValue(documentKey, value);
  }

  return userList.map((user) => (removeSensitiveInfo ? levelSpecificAccess(user) : user));
};

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole,
  retreiveFilteredUsers,
  levelSpecificAccess,
  fetchUsersForKeyValues,
};
