const firestore = require("../../utils/firestore");
const userCollection = firestore.collection("users");

/**
 * @return {boolean} success - are roles deleted or not
 */
module.exports = async (userId = null, rolesToBeDeleted = [], deleteRolesObject = false) => {
  if (!userId) return false;

  try {
    const userDoc = await userCollection.doc(userId).get();

    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    if (deleteRolesObject) delete userData.roles;
    else rolesToBeDeleted.forEach((role) => delete userData.roles[String(role)]);

    await userCollection.doc(userId).set(userData);

    return true;
  } catch (error) {
    return false;
  }
};
