const firestore = require("../utils/firestore");
const { formatUsername } = require("../utils/username");
const userModel = firestore.collection("users");
const tasksModel = require("../models/tasks");
const dataAccess = require("./dataAccessLayer");
const { NotFound, BadRequest, InternalServerError } = require("http-errors");
const logger = require("../utils/logger");
const ROLES = require("../constants/roles");
const { isLastPRMergedWithinDays } = require("./githubService");
const { getUserStatus } = require("../models/userStatus");
const { getOverdueTasks } = require("../models/tasks");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

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
 * @param userId { string }: Id of the User
 * @returns Promise<object>
 */
const findUserById = async (userId) => {
  let result;
  try {
    result = await dataAccess.retrieveUsers({ id: userId });
    if (!result.userExists) {
      throw NotFound("User doesn't exist");
    }
    return result.user;
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
};

/**
 * @param userData { Object }: req.userData
 * @returns Promise<object>
 */
const getUserByProfileData = async (userData) => {
  if (!userData.id) {
    throw BadRequest("User ID not provided.");
  }

  try {
    const result = await dataAccess.retrieveUsers({ id: userData.id });
    return result.user;
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
};

/**
 * @param days {number}: days since last unmerged pr.
 * @returns Promise<object[]>
 */
const getUsersByUnmergedPrs = async (days) => {
  try {
    const inDiscordUser = await dataAccess.retrieveUsersWithRole(ROLES.INDISCORD);
    const users = [];

    for (const user of inDiscordUser) {
      const username = user.github_id;
      const isMerged = await isLastPRMergedWithinDays(username, days);
      if (!isMerged) {
        users.push(user.id);
      }
    }

    return users;
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    throw error;
  }
};

/**
 * @param discordId { string }: discordId of the user
 * @returns Promise<object>
 */
const getUserByDiscordId = async (discordId) => {
  let result, user;
  try {
    result = await dataAccess.retrieveUsers({ discordId });
    user = result.user;
    if (!result.userExists) {
      return null;
    }

    const userStatusResult = await getUserStatus(user.id);
    if (userStatusResult.userStatusExists) {
      user.state = userStatusResult.data.currentStatus.state;
    }
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    throw error;
  }
  return user;
};

/**
 * @param queryObject { Object }: request query object
 * @returns Promise<object>
 */
const getDepartedUsers = async (queryObject) => {
  try {
    const result = await dataAccess.retrieveUsers({ query: queryObject });
    const departedUsers = await getUsersWithIncompleteTasks(result.users);
    if (!departedUsers || departedUsers.length === 0) return { departedUsers: [] };
    return { result, departedUsers };
  } catch (error) {
    logger.error("Error when fetching users who abandoned tasks:", error);
    throw new InternalServerError(INTERNAL_SERVER_ERROR);
  }
};

/**
 * @param days { number }: overdue days
 * @param dev {boolean}: dev feature flag
 * @returns Promise<object[]>
 */
const getUsersByOverDueTasks = async (days, dev) => {
  try {
    const tasksData = await getOverdueTasks(days);
    if (!tasksData.length) {
      return [];
    }
    const userIds = new Set();
    const usersData = [];

    tasksData.forEach((task) => {
      if (task.assignee) {
        userIds.add(task.assignee);
      }
    });

    const userInfo = await dataAccess.retrieveUsers({ userIds: Array.from(userIds) });
    userInfo.forEach((user) => {
      if (!user.roles.archived) {
        const userTasks = tasksData.filter((task) => task.assignee === user.id);
        const userData = {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
        };
        if (dev) {
          userData.tasks = userTasks;
        }
        usersData.push(userData);
      }
    });

    return usersData;
  } catch (error) {
    logger.error(`Error while fetching users and tasks: ${error}`);
    throw error;
  }
};

module.exports = {
  generateUniqueUsername,
  getUsersWithIncompleteTasks,
  getUsersByOverDueTasks,
  getDepartedUsers,
  getUserByProfileData,
  getUsersByUnmergedPrs,
  getUserByDiscordId,
  findUserById,
};
