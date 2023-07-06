const userQuery = require("../models/users");

const retrieveUsers = async ({ id = null, usernames = null, req = null }) => {
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
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(req.query);
    allUsers.forEach((element) => {
      removeSensitiveInfo(element);
    });
    return { allUsers, nextId, prevId };
  }
};

const removeSensitiveInfo = function (obj, properties = ["phone", "email", "chaincode", "tokens"]) {
  for (let i = 0; i < properties.length; i++) {
    if (properties[i] in obj) {
      delete obj[properties[i]];
    }
  }
};

module.exports = {
  retrieveUsers,
  removeSensitiveInfo,
};
