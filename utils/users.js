const { fetchUser } = require("../models/users");

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

/**
 * Returns a random object from the array of colors to user
 * @param array {array} : array containing objects
 * @returns random Index number : index between the range 0 to array.length
 */
const getRandomIndex = (array = []) => {
  return Math.floor(Math.random() * (array.length - 0) + 0);
};

module.exports = {
  getUserId,
  getUsername,
  getParticipantUserIds,
  getParticipantUsernames,
  getRandomIndex,
};
