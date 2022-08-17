const firestore = require("../../utils/firestore");
const userCollection = firestore.collection("users");

/**
 * Deletes the specified roles for a user
 * @param {string} userId - to identify the user whose roles are to be deleted
 * @param {string[]} rolesToBeDeleted - roles to be deleted
 * @return {boolean} success - are roles deleted or not
 */
module.exports = async (userId, rolesToBeDeleted = []) => {
  if (!userId) return false;

  try {
    const userDoc = await userCollection.doc(userId).get();

    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    rolesToBeDeleted.forEach((role) => delete userData.roles[String(role)]);
    await userCollection.doc(userId).set(userData);

    return true;
  } catch (error) {
    logger.error(`Error deleting user's roles object: ${error}`);
    return false;
  }
};
