/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");

/**
 * Fetches the data about our users with roles
 * @return {Promise<userModel|Array>}
 */

const fetchUsersWithRole = async (role) => {
  try {
    const snapshot = await userModel.where(`roles.${role}`, "==", true).get();
    const onlyMembers = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        onlyMembers.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }
    return onlyMembers;
  } catch (err) {
    logger.error("Error retrieving members data with roles of member", err);
    throw err;
  }
};

module.exports = {
  fetchUsersWithRole,
};
