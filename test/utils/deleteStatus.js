const firestore = require("../../utils/firestore");
const userModal = firestore.collection("users");

/**
 * Deling the status for user
 * @param {String} userId
 * @returns {boolean} success - is the status deleted or not
 */
module.exports = async (userId) => {
  if (!userId) {
    logger.info("User id is required to delete status");
    return false;
  }

  try {
    const userRef = await userModal.doc(userId).get();

    if (!userRef.exists) {
      logger.info(`User with id : ${userId} not found`);
      return false;
    }

    const userData = userRef.data();
    if (userData.status) {
      delete userData.status;
      await userModal.doc(userId).set(userData);
    }

    return true;
  } catch (error) {
    logger.error(`Error deleting user's status: ${error}`);
    return false;
  }
};
