const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const cardColorArray = require("../constants/cardColorArray");
const { getRandomIndex } = require("../utils/users");
/**
 * Adds default colors property
 * @return {Promise<usersMigrated|Object>}
 */

const addDefaultColors = async () => {
  try {
    const usersSnapshot = await userModel.get();
    const migratedUsers = [];
    const updateUserPromises = [];
    const usersArr = [];

    usersSnapshot.forEach((doc) => usersArr.push({ id: doc.id, ...doc.data() }));

    for (const user of usersArr) {
      const colors = user.colors ? user.colors : {};
      if (user.colors === undefined) {
        const userColorIndex = getRandomIndex(cardColorArray);

        colors.primary_color = cardColorArray[parseInt(userColorIndex)].COLOR_PRIMARY;
        colors.secondary_color = cardColorArray[parseInt(userColorIndex)].COLOR_SECONDARY;
        updateUserPromises.push(userModel.doc(user.id).set({ ...user, colors }));
        migratedUsers.push(user.username);
      }
    }

    await Promise.all(updateUserPromises);
    return { count: migratedUsers.length, users: migratedUsers };
  } catch (err) {
    logger.error("Error adding default colors to users", err);
    throw err;
  }
};

module.exports = {
  addDefaultColors,
};
