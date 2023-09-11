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

const isUsernameLowercase = (username) => {
  for (const currentChar of username) {
    const currentCharCode = currentChar.charCodeAt(0);
    if (currentCharCode >= 65 && currentCharCode <= 90) {
      return false;
    }
  }
  return true;
};

module.exports = {
  archiveUsers,
  isUsernameLowercase,
};
