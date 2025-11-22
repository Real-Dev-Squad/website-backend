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
  let result;

  if (id || username) {
    if (id != null) {
      result = await userQuery.fetchUser({ userId: id });
    } else {
      result = await userQuery.fetchUser({ username });
    }
    const user = levelSpecificAccess(result.user, level, role);
    result.user = user;
    return result;
  }

  if (usernames) {
    const { users } = await userQuery.fetchUsers(usernames);
    const processedUsers = users.map((userdata) => levelSpecificAccess(userdata, level, role));
    return processedUsers;
  }

  if (userIds) {
    if (userIds.length === 0) {
      return {};
    }

    const userDetails = await userQuery.fetchUserByIds(userIds);

    for (const [, userData] of Object.entries(userDetails)) {
      if (userData && typeof userData === "object") {
        removeSensitiveInfo(userData);
      }
    }

    return userDetails;
  }

  if (query) {
    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(query);
    const users = allUsers.map((userdata) => levelSpecificAccess(userdata, level, role));
    return { users, nextId, prevId };
  }

  if (discordId !== null) {
    result = await userQuery.fetchUser({ discordId });
    return levelSpecificAccess(result, level, role);
  }

  if (userdata) {
    const result = await userQuery.fetchUser({ userId: userdata.id });
    return levelSpecificAccess(result.user, level, role);
  }

  return { userExists: false };
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

const retrieveUsersWithRole = async (role) => {
  const users = await members.fetchUsersWithRole(role);
  users.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return users;
};

const removeSensitiveInfo = (obj, level = ACCESS_LEVEL.PUBLIC) => {
  if (!obj || typeof obj !== "object") return;

  const safeLevels = Object.create(null);

  const entries = Object.entries(KEYS_NOT_ALLOWED);
  for (const entry of entries) {
    const keyName = entry[0];
    const val = entry[1];

    if (typeof keyName === "string" && Array.isArray(val)) {
      Reflect.defineProperty(safeLevels, keyName, {
        value: [...val],
        writable: false,
        enumerable: true,
      });
    }
  }

  const hasLevel = Reflect.has(safeLevels, level);
  const keysToRemove = hasLevel && Array.isArray(Reflect.get(safeLevels, level)) ? Reflect.get(safeLevels, level) : [];

  for (const key of keysToRemove) {
    if (typeof key === "string" && key !== "__proto__" && key !== "prototype" && key !== "constructor") {
      if (Reflect.has(obj, key)) {
        Reflect.deleteProperty(obj, key);
      }
    }
  }
};

const levelSpecificAccess = (user, level = ACCESS_LEVEL.PUBLIC, role = null) => {
  let allowedRoles = [];

  if (Reflect.has(ROLE_LEVEL, level)) {
    const rolesValue = Reflect.get(ROLE_LEVEL, level);
    if (Array.isArray(rolesValue)) {
      allowedRoles = rolesValue;
    }
  }

  const isPublicLevel = level === ACCESS_LEVEL.PUBLIC;
  const hasRoleAccess = Array.isArray(allowedRoles) && allowedRoles.includes(role);

  if (isPublicLevel || hasRoleAccess) {
    removeSensitiveInfo(user, level);
    return user;
  }

  return "unauthorized";
};

/**
 * Fetch users based on document key and value
 * @param documentKey {string | FieldPath} -  Model field path.
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
  retrieveUsersWithRole,
  retreiveFilteredUsers,
  levelSpecificAccess,
  fetchUsersForKeyValues,
};
