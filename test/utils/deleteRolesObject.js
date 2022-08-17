const firestore = require("../../utils/firestore");
const userCollection = firestore.collection("users");

/**
 * @return {boolean} success - are roles deleted or not
 */
module.exports = async (userId = null) => {
  if (!userId) return false;

  try {
    const userDoc = await userCollection.doc(userId).get();

    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    delete userData.roles;
    await userCollection.doc(userId).set(userData);

    return true;
  } catch (error) {
    return false;
  }
};
