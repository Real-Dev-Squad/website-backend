const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");

/**
 * Adds default colors property
 * @return {Promise<usersArr|Object>}
 */

const returnUsers = async () => {
  try {
    const usersSnapshot = await userModel.get();
    const usersArr = [];

    usersSnapshot.forEach((doc) => usersArr.push({ id: doc.id, ...doc.data() }));

    return { usersArr };
  } catch (err) {
    logger.error("Error adding default colors to users", err);
    throw err;
  }
};

module.exports = {
  returnUsers,
};
