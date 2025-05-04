import httpError from "http-errors";
import { getUserIdBasedOnRoute } from "../utils/userStatus.js";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";
import { retrieveUsers } from "../services/dataAccessLayer.js";
import {
  deleteUserStatus as deleteUserStatusModel,
  getUserStatus as getUserStatusModel,
  getAllUserStatus as getAllUserStatusModel,
  updateUserStatus as updateUserStatusModel,
  updateAllUserStatus as updateAllUserStatusModel,
  getTaskBasedUsersStatus as getTaskBasedUsersStatusModel,
  batchUpdateUsersStatus as batchUpdateUsersStatusModel,
  cancelOooStatus as cancelOooStatusModel,
} from "../models/userStatus.js";
import { userState, CANCEL_OOO } from "../constants/userStatus.js";
import { ROLES } from "../constants/roles.js";
import firestore from "../utils/firestore.js";
import logger from "../utils/logger.js";

const usersCollection = firestore.collection("users");

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
    const deletedUserStatus = await deleteUserStatusModel(userId);
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
      const userData = await getUserStatusModel(userId);
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
    const { allUserStatus } = await getAllUserStatusModel(req.query);
    const activeUsers = [];
    if (allUserStatus) {
      const allUsersStatusFetchPromises = allUserStatus.map(async (status) => {
        //  fetching users from users collection with the help of userID in userStatus collection
        const result = await retrieveUsers({ id: status.userId });
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
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.boom.notFound("The User doesn't exist.");
    }

    if (userId) {
      const dataToUpdate = req.body;
      const updateStatus = await updateUserStatusModel(userId, dataToUpdate);
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
    const data = await updateAllUserStatusModel();
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
    const data = await getTaskBasedUsersStatusModel();
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
    const data = await batchUpdateUsersStatusModel(req.body.users);
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
    const responseObject = await cancelOooStatusModel(userId);
    return res.status(200).json(responseObject);
  } catch (error) {
    logger.error(`Error while cancelling the ${userState.OOO} Status : ${error}`);
    if (error instanceof httpError.Forbidden) {
      return res.status(403).json({
        statusCode: 403,
        error: "httpErrpr.Forbidden",
        message: error.message,
      });
    } else if (error instanceof httpError.NotFound) {
      return res.status(404).json({
        statusCode: 404,
        error: "httpErrpr.NotFound",
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

const updateUserStatuses = async (req, res, next) => {
  try {
    const { id: currentUserId, roles = {} } = req.userData;
    const isSelf = req.params.userId === currentUserId;
    const isSuperUser = roles[ROLES.SUPERUSER];

    if (isSelf || isSuperUser) {
      if (isSelf && Object.keys(req.body).includes(CANCEL_OOO)) {
        return await cancelOOOStatus(req, res, next);
      }
      return await updateUserStatus(req, res, next);
    }

    return res.boom.unauthorized("You are not authorized to perform this action.");
  } catch (err) {
    logger.error(`Error in updateUserStatusController: ${err}`);
    return res.boom.badImplementation("An unexpected error occurred.");
  }
};

export {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  getTaskBasedUsersStatus,
  getUserStatusControllers,
  batchUpdateUsersStatus,
  updateUserStatusController,
  updateUserStatuses,
};
