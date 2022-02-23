const userQuery = require("../models/users");
const profileDiffsQuery = require("../models/profileDiffs");
const logsQuery = require("../models/logs");
const imageService = require("../services/imageService");

/**
 * Fetches the data about our users
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUsers = async (req, res) => {
  try {
    const allUsers = await userQuery.fetchUsers(req.query);

    return res.json({
      message: "Users returned successfully!",
      users: allUsers,
    });
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
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
    return res.boom.serverUnavailable("Something went wrong please contact admin");
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
    return res.boom.serverUnavailable("Something went wrong please contact admin");
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
    return res.boom.badImplementation("An internal server error occurred");
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
    return res.boom.serverUnavailable("Something went wrong please contact admin");
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
    return res.boom.badImplementation("An internal server error occurred");
  }
};

/**
 * Updates the user data to the latest diffs
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { user } = await userQuery.fetchUser({ username: req.params.username });
    const { id: profileId, ...profileDiffs } = await profileDiffsQuery.fetchProfileDiffsData(req.params.username);

    await profileDiffsQuery.update({ approval: "APPROVED" }, profileId);
    await userQuery.addOrUpdate(profileDiffs, user.id);
    await logsQuery.addProfileLog(user, profileDiffs, req.params.username);

    return res.json({
      message: "Updated user's data successfully!",
    });
  } catch (error) {
    logger.error(`Error while updating user data: ${error}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

const identityURL = async (req, res) => {
  try {
    const { username, identityURL: oldIdentityURL } = req.userData;
    const newIdentityURL = req.body.identityURL;
    const userId = req.userData.id;
    oldIdentityURL !== newIdentityURL &&
      (await userQuery.addOrUpdate(req.body, userId)) &&
      (await logsQuery.add(
        "identityURL",
        `username=${username} oldIdentityURL=${oldIdentityURL} newIdentityURL=${newIdentityURL}`
      ));
    return res.json({
      message:
        oldIdentityURL !== newIdentityURL ? "Updated identity URL!!" : "Please pass a new Identity URL to update!",
    });
  } catch (error) {
    logger.error(`Internal Server Error: ${error}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};
module.exports = {
  updateSelf,
  getUsers,
  getSelfDetails,
  getUser,
  getUsernameAvailabilty,
  postUserPicture,
  updateUser,
  identityURL,
};
