const chaincodeQuery = require("../models/chaincodes");
const userQuery = require("../models/users");
const profileDiffsQuery = require("../models/profileDiffs");
const logsQuery = require("../models/logs");
const imageService = require("../services/imageService");
const { profileDiffStatus } = require("../constants/profileDiff");
const { logType } = require("../constants/logs");
const ROLES = require("../constants/roles");
const dataAccess = require("../services/dataAccessLayer");
const { isLastPRMergedWithinDays } = require("../services/githubService");
const logger = require("../utils/logger");
const { SOMETHING_WENT_WRONG, INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { getPaginationLink, getUsernamesFromPRs, getRoleToUpdate } = require("../utils/users");
const { setInDiscordFalseScript, setUserDiscordNickname } = require("../services/discordService");
const { generateDiscordProfileImageUrl } = require("../utils/discord-actions");
const { addRoleToUser, getDiscordMembers } = require("../services/discordService");
const { fetchAllUsers } = require("../models/users");
const { getOverdueTasks } = require("../models/tasks");
const { getQualifiers } = require("../utils/helper");
const { parseSearchQuery } = require("../utils/users");
const { getFilteredPRsOrIssues } = require("../utils/pullRequests");
const {
  USERS_PATCH_HANDLER_ACTIONS,
  USERS_PATCH_HANDLER_ERROR_MESSAGES,
  USERS_PATCH_HANDLER_SUCCESS_MESSAGES,
} = require("../constants/users");
const { addLog } = require("../models/logs");

const verifyUser = async (req, res) => {
  const userId = req.userData.id;
  try {
    if (!req.userData?.profileURL) {
      return res.boom.serverUnavailable("ProfileURL is Missing");
    }
    await userQuery.addOrUpdate({ profileStatus: "PENDING" }, userId);
  } catch (error) {
    logger.error(`Error while verifying user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
  fetch(process.env.IDENTITY_SERVICE_URL, {
    method: "POST",
    body: JSON.stringify({ userId }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json({
    message: "Your request has been queued successfully",
  });
};

const getUserById = async (req, res) => {
  let result, user;
  try {
    result = await dataAccess.retrieveUsers({ id: req.params.userId });
    user = result.user;
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }

  if (!result.userExists) {
    return res.boom.notFound("User doesn't exist");
  }

  return res.json({
    message: "User returned successfully!",
    user,
  });
};

/**
 * Fetches the data about our users
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUsers = async (req, res) => {
  try {
    // getting user details by id if present.
    const query = req.query?.query ?? "";
    const transformedQuery = parseSearchQuery(query);
    const qualifiers = getQualifiers(query);

    // getting user details by id if present.
    if (req.query.id) {
      const id = req.query.id;
      let result, user;
      try {
        result = await dataAccess.retrieveUsers({ id: id });
        user = result.user;
      } catch (error) {
        logger.error(`Error while fetching user: ${error}`);
        return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
      }
      if (!result.userExists) {
        return res.boom.notFound("User doesn't exist");
      }
      return res.json({
        message: "User returned successfully!",
        user,
      });
    }
    if (!transformedQuery?.days && transformedQuery?.filterBy === "unmerged_prs") {
      return res.boom.badRequest(`Days is required for filterBy ${transformedQuery?.filterBy}`);
    }

    const { filterBy, days } = transformedQuery;
    if (filterBy === "unmerged_prs" && days) {
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

        return res.json({
          message: "Inactive users returned successfully!",
          count: users.length,
          users: users,
        });
      } catch (error) {
        logger.error(`Error while fetching all users: ${error}`);
        return res.boom.serverUnavailable("Something went wrong please contact admin");
      }
    }

    if (transformedQuery?.filterBy === "overdue_tasks") {
      try {
        const tasksData = await getOverdueTasks(days);
        const users = new Set();
        tasksData.forEach((task) => {
          users.add(task.assignee);
        });
        return res.json({
          message: "Users returned successfully!",
          count: users.size,
          users: Array.from(users),
        });
      } catch (error) {
        logger.error(`Error while fetching all users: ${error}`);
        return res.boom.serverUnavailable("Something went wrong please contact admin");
      }
    }

    if (qualifiers?.filterBy) {
      const allPRs = await getFilteredPRsOrIssues(qualifiers);
      const usernames = getUsernamesFromPRs(allPRs);
      const users = await dataAccess.retrieveUsers({ usernames: usernames });
      return res.json({
        message: "Users returned successfully!",
        users,
      });
    }

    const data = await dataAccess.retrieveUsers({ query: req.query });

    return res.json({
      message: "Users returned successfully!",
      users: data.users,
      links: {
        next: data.nextId ? getPaginationLink(req.query, "next", data.nextId) : "",
        prev: data.prevId ? getPaginationLink(req.query, "prev", data.prevId) : "",
      },
    });
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetches the data about user with given id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUser = async (req, res) => {
  try {
    const result = await dataAccess.retrieveUsers({ username: req.params.username });
    const user = result.user;
    if (result.userExists) {
      return res.json({
        message: "User returned successfully!",
        user,
      });
    }

    return res.boom.notFound("User doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const getUserSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = await userQuery.fetchUserSkills(id);

    return res.json({
      message: "Skills returned successfully",
      skills,
    });
  } catch (err) {
    logger.error(`Error fetching skills ${err}`);
    return res.boom.badImplementation("Internal server error");
  }
};

/**
 * Fetches users based on given skill
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getSuggestedUsers = async (req, res) => {
  try {
    const { users } = await userQuery.getSuggestedUsers(req.params.skillId);

    return res.json({
      message: "Users returned successfully!",
      users,
    });
  } catch (err) {
    logger.error(`Error while fetching suggested users: ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * checks whether a given username is available
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUsernameAvailabilty = async (req, res) => {
  try {
    const result = await dataAccess.retrieveUsers({ username: req.params.username });
    return res.json({
      isUsernameAvailable: !result.userExists,
    });
  } catch (error) {
    logger.error(`Error while checking user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const generateUsername = async (req, res) => {
  try {
    const { firstname, lastname, dev } = req.query;
    if (dev === "true") {
      const username = await userQuery.generateUniqueUsername(firstname, lastname);
      return res.json({ username });
    } else {
      return res.status(404).json({
        message: "UserName Not Found",
      });
    }
  } catch (error) {
    logger.error(`Error while checking user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetches the data about logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getSelfDetails = async (req, res) => {
  try {
    if (req.userData) {
      const user = await dataAccess.retrieveUsers({
        userdata: req.userData,
      });
      return res.send(user);
    }
    return res.boom.notFound("User doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update the user
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - User object
 * @param res {Object} - Express response object
 */
const updateSelf = async (req, res) => {
  try {
    const { id: userId } = req.userData;
    if (req.body.username) {
      const { user } = await dataAccess.retrieveUsers({ id: userId });
      if (!user.incompleteUserDetails) {
        return res.boom.forbidden("Cannot update username again");
      }
      await userQuery.setIncompleteUserDetails(userId);
    }

    const user = await userQuery.addOrUpdate(req.body, userId);

    if (!user.isNewUser) {
      // Success criteria, user finished the sign up process.
      userQuery.initializeUser(userId);
      return res.status(204).send();
    }

    return res.boom.notFound("User not found");
  } catch (error) {
    logger.error(`Error while updating user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Post user profile picture
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const postUserPicture = async (req, res) => {
  const { file } = req;
  const { id: userId, discordId } = req.userData;
  const { coordinates } = req.body;
  let discordAvatarUrl = "";
  let imageData;
  let verificationResult;
  try {
    discordAvatarUrl = await generateDiscordProfileImageUrl(discordId);
  } catch (error) {
    logger.error(`Error while adding profile picture of user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
  try {
    const coordinatesObject = coordinates && JSON.parse(coordinates);
    imageData = await imageService.uploadProfilePicture({ file, userId, coordinates: coordinatesObject });
  } catch (error) {
    logger.error(`Error while adding profile picture of user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
  try {
    verificationResult = await userQuery.addForVerification(userId, discordId, imageData.url, discordAvatarUrl);
  } catch (error) {
    logger.error(`Error while adding profile picture of user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
  return res.status(201).json({
    message: `Profile picture uploaded successfully! ${verificationResult.message}`,
    image: imageData,
  });
};

/**
 * Updates the user data
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const verifyUserImage = async (req, res) => {
  try {
    const { type: imageType } = req.query;
    const { id: userId } = req.params;
    await userQuery.markAsVerified(userId, imageType);
    return res.json({
      message: `${imageType} image was verified successfully!`,
    });
  } catch (error) {
    logger.error(`Error while verifying image of user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Patch Update user nickname
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const updateDiscordUserNickname = async (req, res) => {
  const { userId } = req.params;
  try {
    const userToBeUpdated = await dataAccess.retrieveUsers({ id: userId });
    const { discordId, username } = userToBeUpdated.user;
    if (!discordId) {
      throw new Error("user not verified");
    }
    await setUserDiscordNickname(username, discordId);
    return res.json({
      userAffected: {
        userId,
        username,
        discordId,
      },
      message: "User nickname changed successfully",
    });
  } catch (err) {
    logger.error(`Error while updating nickname: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
const markUnverified = async (req, res) => {
  try {
    const [usersInRdsDiscordServer, allRdsLoggedInUsers] = await Promise.all([getDiscordMembers(), fetchAllUsers()]);
    const rdsUserMap = {};
    const unverifiedRoleId = config.get("discordUnverifiedRoleId");
    const usersToApplyUnverifiedRole = [];
    const addRolePromises = [];
    const discordDeveloperRoleId = config.get("discordDeveloperRoleId");

    allRdsLoggedInUsers.forEach((user) => {
      rdsUserMap[user.discordId] = true;
    });

    usersInRdsDiscordServer.forEach((discordUser) => {
      const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
      const isMissingUnverifiedRole = !discordUser.roles.includes(unverifiedRoleId);
      const isUserUnverified = !rdsUserMap[discordUser.user.id]; // Doesn't have discordId in RDS user object

      if (isDeveloper && isUserUnverified && isMissingUnverifiedRole) {
        usersToApplyUnverifiedRole.push(discordUser.user.id);
      }
    });

    usersToApplyUnverifiedRole.forEach((id) => {
      addRolePromises.push(addRoleToUser(id, unverifiedRoleId));
    });

    await Promise.all(addRolePromises);
    return res.json({ message: "ROLES APPLIED SUCCESSFULLY" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

/**
 * Updates the user data
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUserImageForVerification = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const userImageVerificationData = await userQuery.getUserImageForVerification(userId);
    return res.json({
      message: "User image verification record fetched successfully!",
      data: userImageVerificationData,
    });
  } catch (error) {
    logger.error(`Error while verifying image of user: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Updates the user data
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { id: profileDiffId, message } = req.body;

    const profileDiffData = await profileDiffsQuery.fetchProfileDiff(profileDiffId);
    if (!profileDiffData) return res.boom.notFound("Profile Diff doesn't exist");

    const { approval, timestamp, userId, ...profileDiff } = profileDiffData;

    const user = await dataAccess.retrieveUsers({ id: userId });
    if (!user.userExists) return res.boom.notFound("User doesn't exist");

    await profileDiffsQuery.updateProfileDiff({ approval: profileDiffStatus.APPROVED }, profileDiffId);

    await userQuery.addOrUpdate(profileDiff, userId);

    const meta = {
      approvedBy: req.userData.id,
      userId: userId,
    };

    await logsQuery.addLog(logType.PROFILE_DIFF_APPROVED, meta, { profileDiffId, message });

    return res.json({
      message: "Updated user's data successfully!",
    });
  } catch (error) {
    logger.error(`Error while updating user data: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const generateChaincode = async (req, res) => {
  try {
    const { id } = req.userData;

    const chaincode = await chaincodeQuery.storeChaincode(id);
    await userQuery.addOrUpdate({ chaincode }, id);
    return res.json({
      chaincode,
      message: "Chaincode returned successfully",
    });
  } catch (error) {
    logger.error(`Error while generating chaincode: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const profileURL = async (req, res) => {
  try {
    const userId = req.userData.id;
    const { profileURL } = req.body;
    await userQuery.addOrUpdate({ profileURL }, userId);
    return res.json({
      message: "updated profile URL!!",
    });
  } catch (error) {
    logger.error(`Internal Server Error: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const rejectProfileDiff = async (req, res) => {
  try {
    const { profileDiffId, message } = req.body;
    const profileResponse = await profileDiffsQuery.updateProfileDiff(
      { approval: profileDiffStatus.REJECTED },
      profileDiffId
    );

    if (profileResponse.notFound) return res.boom.notFound("Profile Diff doesn't exist");

    const meta = {
      rejectedBy: req.userData.id,
      userId: profileResponse.userId,
    };

    await logsQuery.addLog(logType.PROFILE_DIFF_REJECTED, meta, { profileDiffId, message });

    return res.json({
      message: "Profile Diff Rejected successfully!",
    });
  } catch (error) {
    logger.error(`Error while rejecting profile diff: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addUserIntro = async (req, res) => {
  try {
    const rawData = req.body;
    const joinData = await userQuery.getJoinData(req.userData.id);

    if (joinData.length === 1) {
      return res.status(409).json({
        message: "User data is already present!",
      });
    }

    const data = {
      userId: req.userData.id,
      biodata: {
        firstName: rawData.firstName,
        lastName: rawData.lastName,
      },
      location: {
        city: rawData.city,
        state: rawData.state,
        country: rawData.country,
      },
      professional: {
        institution: rawData.college,
        skills: rawData.skills,
      },
      intro: {
        introduction: rawData.introduction,
        funFact: rawData.funFact,
        forFun: rawData.forFun,
        whyRds: rawData.whyRds,
        numberOfHours: rawData.numberOfHours,
      },
      foundFrom: rawData.foundFrom,
    };
    await userQuery.addJoinData(data);

    return res.status(201).json({
      message: "User join data and newstatus data added and updated successfully",
    });
  } catch (err) {
    logger.error("Could not save user data");
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getUserIntro = async (req, res) => {
  try {
    const data = await userQuery.getJoinData(req.params.userId);
    if (data.length) {
      return res.json({
        message: "User data returned",
        data: data,
      });
    } else {
      return res.status(404).json({
        message: "Data Not Found",
      });
    }
  } catch (err) {
    logger.error("Could Not Get User Data", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Returns the lists of usernames where default archived role was added
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addDefaultArchivedRole = async (req, res) => {
  try {
    const addedDefaultArchivedRoleData = await userQuery.addDefaultArchivedRole();
    return res.json({
      message: "Users default archived role added successfully!",
      ...addedDefaultArchivedRoleData,
    });
  } catch (error) {
    logger.error(`Error adding default archived role: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

/**
 * Returns the lists of users who match the specified query params
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const filterUsers = async (req, res) => {
  try {
    if (!Object.keys(req.query).length) {
      return res.boom.badRequest("filter for item not provided");
    }

    const users = await dataAccess.retreiveFilteredUsers(req.query);
    return res.json({
      message: users.length ? "Users found successfully!" : "No users found",
      users: users,
      count: users.length,
    });
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

const nonVerifiedDiscordUsers = async () => {
  const data = await dataAccess.retrieveDiscordUsers();
  return data;
};

const setInDiscordScript = async (req, res) => {
  try {
    await setInDiscordFalseScript();
    return res.json({ message: "Successfully added the in_discord field to false for all users" });
  } catch (err) {
    return res.boom.badImplementation({ message: INTERNAL_SERVER_ERROR });
  }
};

const updateRoles = async (req, res) => {
  try {
    const result = await dataAccess.retrieveUsers({ id: req.params.id });
    if (result?.userExists) {
      const dataToUpdate = req.body;
      const roles = req?.userData?.roles;
      const { reason } = req.body;
      const superUserId = req.userData.id;

      const response = await getRoleToUpdate(result.user, dataToUpdate);
      if (response.updateRole) {
        await userQuery.addOrUpdate(response.newUserRoles, result.user.id);
        if (dataToUpdate?.archived) {
          const body = {
            reason: reason || "",
            archived_user: {
              user_id: result.user.id,
              username: result.user.username,
            },
            archived_by: {
              user_id: superUserId,
              roles: roles,
            },
          };
          addLog("archived-details", {}, body);
        }
        return res.json({
          message: "role updated successfully!",
        });
      } else {
        return res.boom.conflict("Role already exist!");
      }
    } else {
      return res.boom.notFound("User not found");
    }
  } catch (error) {
    logger.error(`Error while updateRoles: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const archiveUserIfNotInDiscord = async () => {
  try {
    const data = await userQuery.archiveUserIfNotInDiscord();

    if (data.totalUsers === 0) {
      return {
        message: USERS_PATCH_HANDLER_ERROR_MESSAGES.ARCHIVE_USERS.NO_USERS_DATA_TO_UPDATE,
        summary: data,
      };
    }

    return {
      message: USERS_PATCH_HANDLER_SUCCESS_MESSAGES.ARCHIVE_USERS.SUCCESSFULLY_UPDATED_DATA,
      summary: data,
    };
  } catch (error) {
    logger.error(`Error while updating the archived role: ${error}`);
    throw Error(INTERNAL_SERVER_ERROR);
  }
};

async function usersPatchHandler(req, res) {
  try {
    const { action } = req.body;
    let response;

    if (action === USERS_PATCH_HANDLER_ACTIONS.NON_VERFIED_DISCORD_USERS) {
      const data = await nonVerifiedDiscordUsers();
      response = data;
    }

    if (action === USERS_PATCH_HANDLER_ACTIONS.ARCHIVE_USERS) {
      const debugQuery = req.query.debug?.toLowerCase();
      const data = await archiveUserIfNotInDiscord();

      if (debugQuery === "true") {
        data.summary.updatedUserDetails = data.summary.updatedUserDetails.slice(-3);
        response = data;
      } else {
        delete data.summary.updatedUserDetails;
        delete data.summary.failedUserDetails;
        response = data;
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error while handling the users common patch route:", error);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  verifyUser,
  generateChaincode,
  updateSelf,
  getUsers,
  getSelfDetails,
  getUser,
  getUsernameAvailabilty,
  generateUsername,
  getSuggestedUsers,
  postUserPicture,
  updateUser,
  rejectProfileDiff,
  getUserById,
  profileURL,
  addUserIntro,
  getUserIntro,
  addDefaultArchivedRole,
  getUserSkills,
  filterUsers,
  verifyUserImage,
  getUserImageForVerification,
  nonVerifiedDiscordUsers,
  setInDiscordScript,
  markUnverified,
  updateRoles,
  updateDiscordUserNickname,
  archiveUserIfNotInDiscord,
  usersPatchHandler,
};
