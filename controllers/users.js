const chaincodeQuery = require("../models/chaincodes");
const userQuery = require("../models/users");
const profileDiffsQuery = require("../models/profileDiffs");
const logsQuery = require("../models/logs");
const imageService = require("../services/imageService");
const { profileDiffStatus } = require("../constants/profileDiff");
const { logType } = require("../constants/logs");
const { fetch } = require("../utils/fetch");
const logger = require("../utils/logger");
const obfuscate = require("../utils/obfuscate");
const { getPaginationLink, getUsernamesFromPRs } = require("../utils/users");
const { getQualifiers } = require("../utils/helper");
const { SOMETHING_WENT_WRONG, INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { getFilteredPRsOrIssues } = require("../utils/pullRequests");

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
  fetch(process.env.IDENTITY_SERVICE_URL, "POST", null, { userId }, { "Content-Type": "application/json" });
  return res.json({
    message: "Your request has been queued successfully",
  });
};

const getUserById = async (req, res) => {
  let result;
  try {
    result = await userQuery.fetchUser({ userId: req.params.userId });
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }

  if (!result.userExists) {
    return res.boom.notFound("User doesn't exist");
  }

  const { phone = "", email = "", ...user } = result.user;
  try {
    user.phone = obfuscate.obfuscatePhone(phone);
    user.email = obfuscate.obfuscateMail(email);
  } catch (error) {
    logger.error(`Error while formatting phone and email: ${error}`);
    return res.boom.badImplementation("Error while formatting phone and email");
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
    const query = req.query?.query ?? "";
    const qualifiers = getQualifiers(query);

    // getting user details by id if present.
    if (req.query.id) {
      const id = req.query.id;
      let result;
      try {
        result = await userQuery.fetchUser({ userId: id });
      } catch (error) {
        logger.error(`Error while fetching user: ${error}`);
        return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
      }

      if (!result.userExists) {
        return res.boom.notFound("User doesn't exist");
      }

      const { phone = "", email = "", ...user } = result.user;
      try {
        user.phone = obfuscate.obfuscatePhone(phone);
        user.email = obfuscate.obfuscateMail(email);
        delete user.phone;
        delete user.email;
      } catch (error) {
        logger.error(`Error while formatting phone and email: ${error}`);
        return res.boom.badImplementation("Error while formatting phone and email");
      }

      return res.json({
        message: "User returned successfully!",
        user,
      });
    }

    if (qualifiers?.filterBy) {
      const allPRs = await getFilteredPRsOrIssues(qualifiers);

      const filteredUsernames = getUsernamesFromPRs(allPRs);

      const { filterdUsersWithDetails } = await userQuery.fetchUsers(filteredUsernames);

      return res.json({
        message: "Users returned successfully!",
        users: filterdUsersWithDetails,
      });
    }

    const { allUsers, nextId, prevId } = await userQuery.fetchPaginatedUsers(req.query);

    return res.json({
      message: "Users returned successfully!",
      users: allUsers,
      links: {
        next: nextId ? getPaginationLink(req.query, "next", nextId) : "",
        prev: prevId ? getPaginationLink(req.query, "prev", prevId) : "",
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
    const result = await userQuery.fetchUser({ username: req.params.username });
    const { phone, email, ...user } = result.user;

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
    const result = await userQuery.fetchUser({ username: req.params.username });
    return res.json({
      isUsernameAvailable: !result.userExists,
    });
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

const getSelfDetails = (req, res) => {
  try {
    if (req.userData) {
      if (req.query.private) {
        return res.send(req.userData);
      }
      const { phone, email, ...userData } = req.userData;
      return res.send(userData);
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
      const { user } = await userQuery.fetchUser({ userId });
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
  try {
    const { file } = req;
    const { id: userId } = req.userData;
    const { coordinates } = req.body;
    const coordinatesObject = coordinates && JSON.parse(coordinates);
    const imageData = await imageService.uploadProfilePicture({ file, userId, coordinates: coordinatesObject });
    return res.json({
      message: "Profile picture uploaded successfully!",
      image: imageData,
    });
  } catch (error) {
    logger.error(`Error while adding profile picture of user: ${error}`);
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

    const user = await userQuery.fetchUser({ userId });
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
      message: "User data added successfully",
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
    const allUsers = await userQuery.getUsersBasedOnFilter(req.query);

    return res.json({
      message: "Users found successfully!",
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = {
  verifyUser,
  generateChaincode,
  updateSelf,
  getUsers,
  getSelfDetails,
  getUser,
  getUsernameAvailabilty,
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
};
