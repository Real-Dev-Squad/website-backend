const userQuery = require("../models/users");
const { USER_SENSITIVE_DATA } = require("../constants/users");

const retrieveUsers = async ({ id = null, username = null, usernames = null, query = null }) => {
  if (id || username) {
    const result = await userQuery.fetchUser({ userId: id, username: username });
    removeSensitiveInfo(result.user);
    return result;
  }
  if (usernames) {
    const { users } = await userQuery.fetchUsers(usernames);
    users.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return users;
  }
  const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
  allUsers.forEach((user) => {
    removeSensitiveInfo(user);
  });
  return { allUsers, nextId, prevId };
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
