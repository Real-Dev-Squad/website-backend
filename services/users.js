const { USERS_PATCH_HANDLER_SUCCESS_MESSAGES, USERS_PATCH_HANDLER_ERROR_MESSAGES } = require("../constants/users");
const firestore = require("../utils/firestore");
const { formatUsername } = require("../utils/username");
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
      updated_at: Date.now(),
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

const generateUniqueUsername = async (firstName, lastName) => {
  try {
    const snapshot = await userModel
      .where("first_name", "==", firstName)
      .where("last_name", "==", lastName)
      .count()
      .get();

    const existingUserCount = snapshot.data().count || 0;

    const suffix = existingUserCount + 1;
    const finalUsername = formatUsername(firstName, lastName, suffix);

    return finalUsername;
  } catch (err) {
    logger.error(`Error while generating unique username: ${err.message}`);
    throw err;
  }
};

module.exports = {
  archiveUsers,
  generateUniqueUsername,
};
