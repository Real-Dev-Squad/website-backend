const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const { months, discordNicknameLength } = require("../constants/users");
const dataAccessLayer = require("../services/dataAccessLayer");
const discordService = require("../services/discordService");
const ROLES = require("../constants/roles");
const dataAccess = require("../services/dataAccessLayer");
const logger = require("./logger");
const addUserToDBForTest = async (userData) => {
  await userModel.add(userData);
};
const { NotFound, BadRequest } = require("http-errors");
const { isLastPRMergedWithinDays } = require("../services/githubService");
const { getUserStatus } = require("../models/userStatus");
const userService = require("../services/users");
const { getOverdueTasks } = require("../models/tasks");
/**
 * Used for receiving userId when providing username
 *
 * @param username {String} - username of the User.
 * @returns id {String} - userId of the same user
 */

const getUserId = async (username) => {
  try {
    const {
      userExists,
      user: { id },
    } = await dataAccessLayer.retrieveUsers({ username });
    return userExists ? id : false;
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};
/**
 * Used for receiving username when providing userId
 *
 * @param userId {String} - userId of the User.
 * @returns username {String} - username of the same user
 */
const getUsername = async (userId) => {
  try {
    const { userExists, user } = await dataAccessLayer.retrieveUsers({ id: userId });
    return userExists ? user.username : undefined;
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};

/**
 * Used for receiving first_name & last_name when providing userId
 *
 * @param userId {String} - userId of the User.
 * @returns {Object} Object with first_name and last_name properties.
 */
const getFullName = async (userId) => {
  try {
    const {
      // eslint-disable-next-line camelcase
      user: { first_name, last_name },
    } = await dataAccessLayer.retrieveUsers({ id: userId });
    // eslint-disable-next-line camelcase
    return { first_name, last_name };
  } catch (error) {
    logger.error("Something went wrong", error);
    throw error;
  }
};
/**
 * Used for receiving username when providing userId, if not found then returns undefined
 *
 * @param userId {String} - userId of the User.
 * @returns username {String} - username of the same user
 */
const getUsernameElseUndefined = async (userId) => {
  try {
    const {
      user: { username },
    } = await dataAccessLayer.retrieveUsers({ id: userId });
    return username;
  } catch (error) {
    logger.error("Something went wrong", error);
    return undefined;
  }
};

/**
 * Used for receiving userId when providing username, if not found then returns undefined
 *
 * @param username {String} - username of the User.
 * @returns id {String} - userId of the same user
 */

const getUserIdElseUndefined = async (username) => {
  return await getUserId(username);
};

/**
 * Converts the userIds entered in the array to corresponding usernames
 * @param participantArray {array} : participants array to be updated
 * @returns participantUsernames {array} : array of usernames of all participants
 */
const getParticipantUsernames = async (participantArray) => {
  try {
    if (!Array.isArray(participantArray)) {
      return [];
    }

    const promises = participantArray.map(async (participant) => {
      const participantUsername = await getUsername(participant.trim());
      return participantUsername;
    });
    const participantUsernames = await Promise.all(promises);
    return participantUsernames;
  } catch (err) {
    logger.error("Error in updating the task object", err);
    throw err;
  }
};
/**
 * Converts the usernames entered in the database to corresponding usernames
 * @param participantArray {array} : participants array to be updated
 * @returns participantUserIds {array} : array of user ids of all participants
 */
const getParticipantUserIds = async (participantArray) => {
  try {
    if (!Array.isArray(participantArray)) {
      return [];
    }

    const promises = participantArray.map(async (participant) => {
      const participantUserId = await getUserId(participant.trim());
      return participantUserId;
    });
    const participantUserIds = await Promise.all(promises);
    return participantUserIds;
  } catch (err) {
    logger.error("Error in updating the task object", err);
    throw err;
  }
};

function getLowestLevelSkill(skills) {
  let level = skills[0].level;
  let skill = skills[0].skill;
  for (const skillfield of skills) {
    if (skillfield.level < level) {
      level = skillfield.level;
      skill = skillfield.skill;
    }
  }
  return { skill, level };
}

/**
 * Creates pagination link for next and previous pages
 *
 * @param query {Object} - request query params
 * @param cursor {string} - next | prev
 * @param documentId {string} - DB document Id
 */

function getPaginationLink(query, cursor, documentId) {
  let endpoint = `/users?${cursor}=${documentId}`;
  const keysToExclude = ["next", "prev", "page"]; // next, prev needs to be updated with new document Id and page is not required in the links.
  for (const [key, value] of Object.entries(query)) {
    if (keysToExclude.includes(key)) continue;
    endpoint = endpoint.concat(`&${key}=${value}`);
  }
  if (!query.size) {
    endpoint = endpoint.concat("&size=100");
  }
  return endpoint;
}

/**
 * @desc Returns an array of unique users from the filtered PRs/Issues response
 * @param allPRs {Array} - list of all PRs/Issues from the respective github service
 */
function getUsernamesFromPRs(allPRs) {
  const uniqueUsernamesSet = new Set();
  const usernames = [];

  allPRs?.forEach((pr) => {
    const username = pr?.username;
    if (!uniqueUsernamesSet.has(username)) {
      uniqueUsernamesSet.add(username);
      usernames.push(username);
    }
  });

  return usernames;
}

/**
 * Checks if user roles need to be updated based on new roles provided.
 *
 * @param {Object} userData - The user data object containing the current roles.
 * @param {Object} newRoles - The new roles to be checked against the current roles.
 * @returns {Promise<Object>} An object indicating whether the roles should be updated and the new user roles.
 */

const getRoleToUpdate = async (userData, newRoles) => {
  if (newRoles.reason) {
    delete newRoles.reason; // delete reason field from newRoles to keep only roles
  }
  const roles = { ...userData.roles };
  const newRolesArray = Object.entries(newRoles);
  if (roles[newRolesArray[0][0]] === newRolesArray[0][1]) return { updateRole: false };
  const newUserRoles = { roles: { ...userData.roles, ...newRoles } };
  return { updateRole: true, newUserRoles };
};

const parseSearchQuery = (queryString) => {
  const searchParams = {};
  const queryParts = queryString.split(" ");
  queryParts.forEach((part) => {
    const [key, value] = part.split(":");
    switch (key.toLowerCase()) {
      case "filterby":
        searchParams.filterBy = value.toLowerCase();
        break;
      case "days":
        searchParams.days = parseInt(value);
        break;
      default:
        break;
    }
  });
  return searchParams;
};

/**
 * Generates discord nickname for a user
 *
 * @param {string} username - The discord username of the user.
 * @returns {string} - Nickname of the user.
 */
const generateOOONickname = (currentUsername = "", from, until, discordRoles) => {
  // TODO : Update this function when we start storing the discord roles in the database
  let username = currentUsername;
  const discordMavenRoleId = config.get("discordMavenRoleId");

  if (discordRoles?.includes(discordMavenRoleId)) {
    username = username
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("-");
  }
  if (!from && !until) return username;
  const untilDate = new Date(Number(until));
  const untilDay = untilDate.getDate();
  const untilMonth = months[untilDate.getMonth()];

  const fromDate = new Date(Number(from));
  const fromDay = fromDate.getDate();
  const fromMonth = months[fromDate.getMonth()];

  const oooMessage = `(OOO ${fromMonth} ${fromDay} - ${untilMonth} ${untilDay})`;

  // the max length of the nickname should be discord nickname length limit - OOO message length
  // the extra 1 is for the space between ooo date and the nickname
  const nicknameLen = discordNicknameLength - oooMessage.length - 1;
  return `${username.substring(0, nicknameLen)} ${oooMessage}`;
};

/**
 * @param userId { string }: Id of the User
 * @param status { object: { from?: number, until: number }}: OOO date object
 * @returns Promise<object>
 */
const updateNickname = async (userId, status = {}) => {
  try {
    const {
      user: { discordId, username, roles = {} },
      discordJoinedAt = {},
    } = await dataAccessLayer.retrieveUsers({ id: userId });

    if (!discordId || !username || !discordJoinedAt || roles[ROLES.ARCHIVED]) {
      throw new Error("User details unavailable");
    }

    try {
      const nickname = generateOOONickname(username, status.from, status.until);

      const response = await discordService.setUserDiscordNickname(nickname, discordId);
      return response;
    } catch (err) {
      logger.error(`${username} Error while updating user's nickname`);
      throw err;
    }
  } catch (err) {
    logger.error(`Error while retrieving discord id and username for ${userId}: ${err}`);
    throw err;
  }
};

/**
 * @param userId { string }: Id of the User
 * @returns Promise<object>
 */
const findUserById = async (userId) => {
  let result;
  try {
    result = await dataAccess.retrieveUsers({ id: userId });
    if (!result.userExists) {
      throw NotFound("User doesn't exist");
    }
    return result.user;
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
};

/**
 * @param userData { Object }: req.userData
 * @returns Promise<object>
 */
const getUserByProfileData = async (userData) => {
  if (!userData.id) {
    throw BadRequest("User ID not provided.");
  }

  try {
    const result = await dataAccess.retrieveUsers({ id: userData.id });
    return result.user;
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
};

/**
 * @param days {number}: days since last unmerged pr.
 * @returns Promise<object[]>
 */
const getUsersByUnmergedPrs = async (days) => {
  try {
    const inDiscordUser = await dataAccess.retrieveUsersWithRole(ROLES.INDISCORD);
    const users = [];

    for (const user of inDiscordUser) {
      const username = user.github_id;
      const isMerged = await isLastPRMergedWithinDays(username, days);
      if (!isMerged) {
        users.push(user.id);
      }
    }

    return users;
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    throw error;
  }
};

/**
 * @param discordId { string }: discordId of the user
 * @returns Promise<object>
 */
const getUserByDiscordId = async (discordId) => {
  let result, user;
  try {
    result = await dataAccess.retrieveUsers({ discordId });
    user = result.user;
    if (!result.userExists) {
      return null;
    }

    const userStatusResult = await getUserStatus(user.id);
    if (userStatusResult.userStatusExists) {
      user.state = userStatusResult.data.currentStatus.state;
    }
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
  return user;
};

/**
 * @param queryObject { Object }: request query object
 * @returns Promise<object>
 */
const getDepartedUsers = async (queryObject) => {
  try {
    const result = await dataAccess.retrieveUsers({ query: queryObject });
    const departedUsers = await userService.getUsersWithIncompleteTasks(result.users);
    if (departedUsers.length === 0) return [];
    return { result, departedUsers };
  } catch (error) {
    logger.error("Error when fetching users who abandoned tasks:", error);
    throw error;
  }
};

/**
 * @param days { number }: overdue days
 * @param dev {boolean}: dev feature flag
 * @returns Promise<object[]>
 */
const getUsersByOverDueTasks = async (days, dev) => {
  try {
    const tasksData = await getOverdueTasks(days);
    if (!tasksData.length) {
      return [];
    }
    const userIds = new Set();
    const usersData = [];

    tasksData.forEach((task) => {
      if (task.assignee) {
        userIds.add(task.assignee);
      }
    });

    const userInfo = await dataAccess.retrieveUsers({ userIds: Array.from(userIds) });
    userInfo.forEach((user) => {
      if (!user.roles.archived) {
        const userTasks = tasksData.filter((task) => task.assignee === user.id);
        const userData = {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
        };
        if (dev) {
          userData.tasks = userTasks;
        }
        usersData.push(userData);
      }
    });

    return usersData;
  } catch (error) {
    logger.error(`Error while fetching users and tasks: ${error}`);
    throw error;
  }
};

module.exports = {
  addUserToDBForTest,
  getUserId,
  getUsername,
  getFullName,
  getParticipantUserIds,
  getParticipantUsernames,
  getLowestLevelSkill,
  getPaginationLink,
  getUsernamesFromPRs,
  getUsernameElseUndefined,
  getUserIdElseUndefined,
  getRoleToUpdate,
  parseSearchQuery,
  generateOOONickname,
  updateNickname,
  findUserById,
  getUserByProfileData,
  getUsersByUnmergedPrs,
  getUserByDiscordId,
  getDepartedUsers,
  getUsersByOverDueTasks,
};
