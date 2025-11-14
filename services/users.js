const firestore = require("../utils/firestore");
const { formatUsername } = require("../utils/username");
const userModel = firestore.collection("users");
const tasksModel = require("../models/tasks");
const userQuery = require("../models/users");
const { ALL_USER_ROLES } = require("../constants/users");
const Forbidden = require("http-errors").Forbidden;

const getUsersWithIncompleteTasks = async (users) => {
  if (users.length === 0) return [];

  try {
    const userIds = users.map((user) => user.id);

    const abandonedTasksQuerySnapshot = await tasksModel.fetchIncompleteTasksByUserIds(userIds);

    if (abandonedTasksQuerySnapshot.empty) {
      return [];
    }

    const userIdsWithIncompleteTasks = new Set(abandonedTasksQuerySnapshot.map((doc) => doc.assignee));

    const eligibleUsersWithTasks = users.filter((user) => userIdsWithIncompleteTasks.has(user.id));

    return eligibleUsersWithTasks;
  } catch (error) {
    logger.error(`Error in getting users who abandoned tasks: ${error}`);
    throw error;
  }
};

const generateUniqueUsername = async (firstName, lastName) => {
  try {
    const snapshot = await userModel
      .where("first_name", "==", firstName)
      .where("last_name", "==", lastName)
      .count()
      .get();

    const existingUserCount = snapshot.data().count || 0;

    const suffix = existingUserCount + 1;
    const finalUsername = formatUsername(firstName, lastName, suffix);

    return finalUsername;
  } catch (err) {
    logger.error(`Error while generating unique username: ${err.message}`);
    throw err;
  }
};

/**
 * Validates user signup details and handles incomplete user details flow.
 *
 * @async
 * @function validateUserSignup
 * @param {string} userId - The id for the user.
 * @param {boolean} incompleteUserDetails - Indicates if the user has incomplete details.
 * @param {string|null} firstName - The user's first name.
 * @param {string|null} lastName - The user's last name.
 * @param {string|null} role - The role to assign to the user.
 * @param {string|null} existingRole - The user's existing role, if any.
 * @returns {Promise<string|null>} Returns a generated username if incompleteUserDetails is true and all required fields are present, otherwise undefined.
 */

const validateUserSignup = async (userId, incompleteUserDetails, firstName, lastName, role, existingRole) => {
  try {
    if (!incompleteUserDetails) {
      const alreadyHasRole = existingRole && ALL_USER_ROLES.includes(existingRole);
      if (role && alreadyHasRole) {
        throw new Forbidden("Cannot update role again");
      }
      return null;
    }
    if (!firstName || !lastName || !role) {
      throw new Forbidden("You are not authorized to perform this operation");
    }
    const username = await generateUniqueUsername(firstName, lastName);
    await userQuery.setIncompleteUserDetails(userId);
    return username;
  } catch (err) {
    logger.error(`Error while validating user signup: ${err.message}`);
    throw err;
  }
};

module.exports = {
  generateUniqueUsername,
  getUsersWithIncompleteTasks,
  validateUserSignup,
};
