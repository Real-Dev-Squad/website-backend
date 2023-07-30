const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");

const archiveInactiveDiscordUsersInBulk = async (usersData) => {
  const batch = firestore.batch();
  const summary = {
    totalUsersArchived: 0,
    totalOperationsFailed: 0,
  };

  usersData.forEach((user) => {
    const id = user.id;
    const updatedUserData = {
      ...user,
      roles: {
        ...user.roles,
        archived: true,
      },
    };
    batch.update(userModel.doc(id), updatedUserData);
  });

  try {
    await batch.commit();
    summary.totalUsersArchived += usersData.length;
    return { message: "Successfully completed batch updates", ...summary };
  } catch (err) {
    logger.error("Firebase batch Operation Failed!");
    summary.totalOperationsFailed += usersData.length;
    return { message: "Firebase batch operation failed", ...summary };
  }
};

module.exports = {
  archiveInactiveDiscordUsersInBulk,
};
