const { Forbidden, NotFound } = require("http-errors");
const { getUserIdBasedOnRoute } = require("../utils/userStatus");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const dataAccess = require("../services/dataAccessLayer");
const userStatusModel = require("../models/userStatus");
const { userState, CANCEL_OOO } = require("../constants/userStatus");

/**
 * Deletes a new User Status
 *
 * @param req {object} - Express Request Object
 * @param res {object} - Express Response Object
 *
 */

const deleteUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUserStatus = await userStatusModel.deleteUserStatus(userId);
    const responseObj = { id: deletedUserStatus.id, userId };
    let statusCode;
    if (deletedUserStatus.userStatusExisted) {
      responseObj.message = "User Status deleted successfully.";
      statusCode = 200;
    } else {
      responseObj.message = "User Status to delete not found.";
      statusCode = 404;
    }
    return res.status(statusCode).json(responseObj);
  } catch (error) {
    logger.error(`Error while deleting User Status: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Collects single User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStatus = async (req, res) => {
  try {
    const userId = getUserIdBasedOnRoute(req);
    if (userId) {
      const userData = await userStatusModel.getUserStatus(userId);
      const { userStatusExists, id, data } = userData;
      const responseObject = { id, userId, data: null, message: "" };
      if (data) responseObject.data = data;
      let statusCode;
      if (userStatusExists) {
        statusCode = 200;
        responseObject.message = "User Status found successfully.";
      } else {
        statusCode = 404;
        responseObject.message = "User Status couldn't be found.";
      }
      return res.status(statusCode).json(responseObject);
    }
    return res.boom.notFound("User Status doesn't exist.");
  } catch (err) {
    logger.error(`Error while fetching the User Status: ${err}`);
    return res.boom.notFound("The User Status could not be found as an internal server error occurred.");
  }
};

/**
 * Collects all User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getAllUserStatus = async (req, res) => {
  try {
    const { allUserStatus } = await userStatusModel.getAllUserStatus(req.query);
    const activeUsers = [];
    if (allUserStatus) {
      const allUsersStatusFetchPromises = allUserStatus.map(async (status) => {
        //  fetching users from users collection with the help of userID in userStatus collection
        const result = await dataAccess.retrieveUsers({ id: status.userId });
        if (!result.user?.roles?.archived) {
          status.full_name = `${result.user.first_name} ${result.user.last_name}`;
          status.picture = result.user.picture;
          status.username = result.user.username;
          activeUsers.push(status);
        }
      });
      await Promise.all(allUsersStatusFetchPromises);
    }
    return res.json({
      message: "All User Status found successfully.",
      totalUserStatus: activeUsers.length,
      allUserStatus: activeUsers,
    });
  } catch (err) {
    logger.error(`Error while fetching all the User Status: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateUserStatus = async (req, res) => {
  try {
    const userId = getUserIdBasedOnRoute(req);
    if (userId) {
      const dataToUpdate = req.body;
      const updateStatus = await userStatusModel.updateUserStatus(userId, dataToUpdate);
      const { userStatusExists, id, data } = updateStatus;
      const responseObject = { id, userId, data: null, message: "" };
      let statusCode;
      if (data) responseObject.data = data;
      if (userStatusExists) {
        responseObject.message = "User Status updated successfully.";
        statusCode = 200;
      } else {
        statusCode = 201;
        responseObject.message = "User Status created successfully.";
      }
      return res.status(statusCode).json(responseObject);
    }
    return res.boom.badImplementation("The User doesn't exist.");
  } catch (err) {
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update All Users Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateAllUserStatus = async (req, res) => {
  try {
    const data = await userStatusModel.updateAllUserStatus();
    return res.status(200).json({
      message: "All User Status updated successfully.",
      data,
    });
  } catch (err) {
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Retrieve users status based on task status
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getTaskBasedUsersStatus = async (req, res) => {
  try {
    const data = await userStatusModel.getTaskBasedUsersStatus();
    return res.json({
      message: "All users based on tasks found successfully.",
      data,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      message: "The server has encountered an unexpected error. Please contact the administrator for more information.",
    });
  }
};

const getUserStatusControllers = async (req, res, next) => {
  if (Object.keys(req.query).includes("aggregate")) {
    await getTaskBasedUsersStatus(req, res, next);
  } else {
    await getAllUserStatus(req, res, next);
  }
};

/**
 * Mass Update User Status of Idle Users to Idle
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const batchUpdateUsersStatus = async (req, res) => {
  try {
    const data = await userStatusModel.batchUpdateUsersStatus(req.body.users);
    return res.json({
      message: "users status updated successfully.",
      data,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      message: "The server has encountered an unexpected error. Please contact the administrator for more information.",
    });
  }
};

const cancelOOOStatus = async (req, res) => {
  const userId = req.userData.id;
  try {
    const responseObject = await userStatusModel.cancelOooStatus(userId);
    return res.status(200).json(responseObject);
  } catch (error) {
    logger.error(`Error while cancelling the ${userState.OOO} Status : ${error}`);
    if (error instanceof Forbidden) {
      return res.status(403).json({
        statusCode: 403,
        error: "Forbidden",
        message: error.message,
      });
    } else if (error instanceof NotFound) {
      return res.status(404).json({
        statusCode: 404,
        error: "NotFound",
        message: error.message,
      });
    }
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Controller function for updating a user's status.
 *
 * @param req {Object} - The express request object.
 * @param res {Object} - The express response object.
 * @param next {Object} - The express next middleware function.
 * @returns {Promise<void>}
 */

const updateUserStatusController = async (req, res, next) => {
  if (Object.keys(req.body).includes(CANCEL_OOO)) {
    await cancelOOOStatus(req, res, next);
  } else {
    await updateUserStatus(req, res, next);
  }
};

module.exports = {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  getTaskBasedUsersStatus,
  getUserStatusControllers,
  batchUpdateUsersStatus,
  updateUserStatusController,
};
