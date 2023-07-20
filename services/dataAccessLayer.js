const userQuery = require("../models/users");
const members = require("../models/members");
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

const retrieveDiscordUsers = async() =>{
  const users = await userQuery.getDiscordUsers();
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
}

const retrieveMembers = async(query) =>{
  const allUsers = await members.fetchUsers(query);
  allUsers.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return allUsers;
}

const retrieveUsersWithRole = async(role) =>{
  const users = await members.fetchUsersWithRole(role);
  users.forEach((element) => {
    removeSensitiveInfo(element);
  });
  return users;
}

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
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole 
};
