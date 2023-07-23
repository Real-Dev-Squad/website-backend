const userQuery = require("../models/users");
const { USER_SENSITIVE_DATA } = require("../constants/users");

const retrieveUsers = async ({ id = null, username = null, usernames = null, query = null, userdata }) => {
  if (id || username) {
    let result;
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
  } else {
    removeSensitiveInfo(userdata);
    return userdata;
  }
};

const retreiveFilteredUsers = async (query) => {
  const users = await userQuery.getUsersBasedOnFilter(query);
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
};

const removeSensitiveInfo = function (obj) {
  for (let i = 0; i < USER_SENSITIVE_DATA.length; i++) {
    if (USER_SENSITIVE_DATA[i] in obj) {
      delete obj[USER_SENSITIVE_DATA[i]];
    }
  }
};

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
  retreiveFilteredUsers,
};
