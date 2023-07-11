const userQuery = require("../models/users");
const { sensitiveData } = require("../constants/users");

const retrieveUsers = async ({ id = null, usernames = null, query = null }) => {
  if (id) {
    const result = await userQuery.fetchUser({ userId: id });
    removeSensitiveInfo(result.user);
    return result;
  } else if (usernames) {
    const { users } = await userQuery.fetchUsers(usernames);
    users.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return users;
  } else {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
    allUsers.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return { allUsers, nextId, prevId };
  }
};

const removeSensitiveInfo = function (obj) {
  for (let i = 0; i < sensitiveData.length; i++) {
    if (sensitiveData[i] in obj) {
      delete obj[sensitiveData[i]];
    }
  }
};

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
};
