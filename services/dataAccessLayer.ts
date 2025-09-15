import { fetchUser, fetchUsers, fetchUserByIds, fetchPaginatedUsers, getDiscordUsers, getUsersBasedOnFilter, fetchUsersListForMultipleValues, fetchUserForKeyValue } from "../models/users.js";
import { fetchUsers as fetchMembers, fetchUsersWithRole } from "../models/members.js";
import { ROLE_LEVEL, KEYS_NOT_ALLOWED, ACCESS_LEVEL } from "../constants/userDataLevels.js";
import { User } from "../typeDefinitions/users.js";

type RetrieveUsersParams = {
  discordId?: string | null;
  id?: string | null;
  username?: string | null;
  usernames?: string[] | null;
  query?: string | null;
  userdata?: User | null;
  level?: string | null;
  role?: string | null;
  userIds?: string[] | null;
}

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
}: RetrieveUsersParams) => {
  let result;
  if (id || username) {
    if (id != null) {
      result = await fetchUser({ userId: id });
    } else {
      result = await fetchUser({ username: username });
    }
    const user = levelSpecificAccess(result.user, level, role);
    result.user = user;
    return result;
  } else if (usernames) {
    const { users } = await fetchUsers(usernames);
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
    // @ts-ignore
    const userDetails = await fetchUserByIds(userIds);
    Object.keys(userDetails).forEach((userId) => {
      removeSensitiveInfo(userDetails[userId]);
    });
    return userDetails;
  } else if (query) {
    // @ts-ignore
    const { allUsers, nextId, prevId } = await fetchPaginatedUsers(query);
    const users = [];
    allUsers.forEach((userdata) => {
      const user = levelSpecificAccess(userdata, level, role);
      users.push(user);
    });
    return { users, nextId, prevId };
  } else if (discordId !== null) {
    result = await fetchUser({ discordId });
    return levelSpecificAccess(result, level, role);
  } else if (userdata) {
    const result = await fetchUser({ userId: userdata.id });
    return levelSpecificAccess(result.user, level, role);
  } else {
    return {
      userExists: false,
    };
  }
};

const retrieveDiscordUsers = async (level = ACCESS_LEVEL.PUBLIC, role = null) => {
  const users = await getDiscordUsers();
  const usersData = [];
  users.forEach((userdata) => {
    const user = levelSpecificAccess(userdata, level, role);
    usersData.push(user);
  });
  return usersData;
};

const retreiveFilteredUsers = async (query) => {
  const users = await getUsersBasedOnFilter(query);
  users.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return users;
};

const retrieveMembers = async (query) => {
  const allUsers = await fetchMembers(query);
  // @ts-ignore
  allUsers.forEach((userdata) => {
    removeSensitiveInfo(userdata);
  });
  return allUsers;
};

const retrieveUsersWithRole = async (role) => {
  const users = await fetchUsersWithRole(role);
  // @ts-ignore
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
 * @param documentKey {string | FieldPath} -  Model field path.
 * @param value {String | Array} - Single field value or list of values to be matched.
 */
const fetchUsersForKeyValues = async (documentKey, value, removeSensitiveInfo = true) => {
  let userList;
  if (Array.isArray(value)) {
    userList = await fetchUsersListForMultipleValues(documentKey, value);
  } else {
    userList = await fetchUserForKeyValue(documentKey, value);
  }

  return userList.map((user) => (removeSensitiveInfo ? levelSpecificAccess(user) : user));
};

export {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole,
  retreiveFilteredUsers,
  levelSpecificAccess,
  fetchUsersForKeyValues,
};

export default {
  retrieveUsers,
  removeSensitiveInfo,
  retrieveDiscordUsers,
  retrieveMembers,
  retrieveUsersWithRole,
  retreiveFilteredUsers,
  levelSpecificAccess,
  fetchUsersForKeyValues,
};
