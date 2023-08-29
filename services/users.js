const { USERS_PATCH_HANDLER_SUCCESS_MESSAGES, USERS_PATCH_HANDLER_ERROR_MESSAGES } = require("../constants/users");
const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");

const archiveUsers = async (usersData) => {
  const batch = firestore.batch();
  const usersBatch = [];
  const summary = {
    totalUsersArchived: 0,
    totalOperationsFailed: 0,
    updatedUserDetails: [],
    failedUserDetails: [],
  };

  usersData.forEach((user) => {
    const { id, first_name: firstName, last_name: lastName } = user;
    const updatedUserData = {
      ...user,
      roles: {
        ...user.roles,
        archived: true,
      },
    };
    batch.update(userModel.doc(id), updatedUserData);
    usersBatch.push({ id, firstName, lastName });
  });

  try {
    await batch.commit();
    summary.totalUsersArchived += usersData.length;
    summary.updatedUserDetails = [...usersBatch];
    return {
      message: USERS_PATCH_HANDLER_SUCCESS_MESSAGES.ARCHIVE_USERS.SUCCESSFULLY_COMPLETED_BATCH_UPDATES,
      ...summary,
    };
  } catch (err) {
    logger.error("Firebase batch Operation Failed!");
    summary.totalOperationsFailed += usersData.length;
    summary.failedUserDetails = [...usersBatch];
    return { message: USERS_PATCH_HANDLER_ERROR_MESSAGES.ARCHIVE_USERS.BATCH_DATA_UPDATED_FAILED, ...summary };
  }
};

/**
 * Fetches the discordId of a user
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<usersModel | Object>} - A promise that resolves to an object containing the user information.
 * @throws {Error} - If an error occurs while retrieving user information.
 */
const getUserDiscordIdUsername = async (userId) => {
  try {
    const user = await userModel.doc(userId).get();
    const userData = user.data();

    const userExists = !!userData;
    if (!userExists) {
      throw new Error("User data not found!");
    }
    const { username, discordId } = userData;
    if (!username || !discordId) {
      throw new Error("Complete user information unavailable!");
    }
    return { username, discordId };
  } catch (err) {
    logger.error(`Failed to get data for user with id ${userId}`);
    throw err;
  }
};

module.exports = {
  archiveUsers,
  getUserDiscordIdUsername,
};
