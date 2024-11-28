const firestore = require("../utils/firestore");
const { formatUsername } = require("../utils/username");
const userModel = firestore.collection("users");
const tasksModel = require("../models/tasks");

const getUsersWithIncompleteTasks = async (users) => {
  if (users.length === 0) return [];

  try {
    const userIds = users.map((user) => user.id);

    const abandonedTasksQuerySnapshot = await tasksModel.fetchIncompleteTasksByUserIds(userIds);

    if (abandonedTasksQuerySnapshot.empty) {
      return [];
    }

    const userIdsWithIncompleteTasks = new Set(abandonedTasksQuerySnapshot.map((doc) => doc.data().assigneeId));

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

module.exports = {
  generateUniqueUsername,
  getUsersWithIncompleteTasks,
};
