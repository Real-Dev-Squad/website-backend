const userQuery = require("../models/users");
const members = require("../models/members");
const { USER_SENSITIVE_DATA } = require("../constants/users");

const retrieveUsers = async ({
  discordId = null,
  id = null,
  username = null,
  usernames = null,
  query = null,
  userdata,
}) => {
  let result;
  if (id || username) {
    if (id != null) {
      result = await userQuery.fetchUser({ userId: id });
    } else {
      result = await userQuery.fetchUser({ username: username });
    }
    removeSensitiveInfo(result.user);
    return result;
  } else if (usernames) {
    const { users } = await userQuery.fetchUsers(usernames);
    users.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return users;
  } else if (query) {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
    allUsers.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return { allUsers, nextId, prevId };
  } else if (discordId !== null) {
    result = await userQuery.fetchUser({ discordId: discordId });
    return result;
  } else {
    removeSensitiveInfo(userdata);
    return userdata;
  }
};

const retrieveDiscordUsers = async () => {
  const users = await userQuery.getDiscordUsers();
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
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

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole,
  retreiveFilteredUsers,
};
