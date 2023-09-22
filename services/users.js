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

function updateInBatch(usersData, addOrUpdateField) {
  while (usersData.length !== 0) {
    let limitedBatch;
    if (usersData.length > 500) {
      limitedBatch = usersData.splice(0, 500);
    } else {
      limitedBatch = usersData.splice(0, usersData.length);
    }
    addOrUpdateField(limitedBatch);
  }
}
const setNicknameSyncedFalseScript = async () => {
  const users = [];
  const usersQuerySnapshot = await userModel.get();
  usersQuerySnapshot.forEach((user) => users.push({ ...user.data(), id: user.id }));
  const updateUsersPromises = [];
  const addField = (users) => {
    users.forEach((user) => {
      const id = user.id;
      // eslint-disable-next-line security/detect-object-injection
      delete user[id];
      const userData = {
        ...user,
        nickname_synced: false,
        updated_at: Date.now(),
      };
      updateUsersPromises.push(userModel.doc(id).update(userData));
    });
  };

  updateInBatch(users, addField);

  await Promise.all(updateUsersPromises);
};

const updateNicknameSynced = async (usersData) => {
  const batch = firestore.batch();
  const usersBatch = [];
  const summary = {
    totalUsersArchived: 0,
    totalOperationsFailed: 0,
    updatedUserDetails: [],
    failedUserDetails: [],
  };
  const updateField = (usersData) => {
    usersData.forEach((id) => {
      const updatedUserData = {
        nickname_synced: true,
      };
      batch.update(userModel.doc(id), updatedUserData);
      usersBatch.push({ id });
    });
  };

  updateInBatch(usersData, updateField);

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

module.exports = {
  archiveUsers,
  setNicknameSyncedFalseScript,
  updateNicknameSynced,
};
