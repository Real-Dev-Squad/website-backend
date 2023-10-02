const { fetchUser } = require("../models/users");
const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const { months, discordNicknameLength } = require("../constants/users");
const dataAccessLayer = require("../services/dataAccessLayer");
const discordService = require("../services/discordService");

const addUserToDBForTest = async (userData) => {
  await userModel.add(userData);
};

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
    } = await fetchUser({ username });

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
    const {
      user: { username },
    } = await fetchUser({ userId });
    return username;
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
    } = await fetchUser({ userId });
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
  try {
    const {
      userExists,
      user: { id },
    } = await fetchUser({ username });

    return userExists ? id : false;
  } catch (error) {
    logger.error("Something went wrong", error);
    return undefined;
  }
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
const generateOOONickname = (username = "", from, until) => {
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
    const { user: { discordId, username } = {} } = await dataAccessLayer.retrieveUsers({ id: userId });
    if (!discordId || !username) {
      throw new Error("Username or discordId unavailable");
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

module.exports = {
  addUserToDBForTest,
  getUserId,
  getUsername,
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
};
