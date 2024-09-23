import { CANCEL_OOO, userState } from "../constants/userStatus";
import { Forbidden, NotFound } from "http-errors";
import {
  getUserStatus as getUserStatusFromModel,
  updateUserStatus as updateUserStatusFromModel,
  updateAllUserStatus as updateAllUserStatusModel,
  batchUpdateUsersStatus as batchUpdateUsersStatusModel,
  deleteUserStatus as deleteUserStatusModel,
  getAllUserStatus as getAllUserStatusModel,
  cancelOooStatus
} from "../models/newUserStatus";
import { getUserIdBasedOnRoute } from "../utils/newUserStatus";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Collects single User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStatus = async (req: any, res: any) => {
  try {
    let userId: string = getUserIdBasedOnRoute(req);
    if (userId) {
      const userData: any = await getUserStatusFromModel(userId);
      const { userStatusExists, id, data } = userData;
      const responseObject = { id, userId, data: null, message: "" };
      if (data) responseObject.data = data;
      let statusCode: number;
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
    // @ts-ignore
    logger.error(`Error while fetching the User Status: ${err}`);
    return res.boom.notFound("The User Status could not be found as an internal server error occurred.");
  }
};

/**
 * Update User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateUserStatus = async (req: any, res: any) => {
  try {
    let userId: string = getUserIdBasedOnRoute(req);
    if (userId) {
      const dataToUpdate = {
        state: "CURRENT",
        ...req.body,
      };
      const updateStatus = await updateUserStatusFromModel(userId, dataToUpdate);
      const { userStatusExists, id, data, futureStatus } = updateStatus;
      const responseObject = { id, data: null, message: "" };
      let statusCode;
      if (data) responseObject.data = data;
      if (userStatusExists) {
        responseObject.message = "User Status updated successfully.";
        statusCode = 200;
      } else if (futureStatus) {
        responseObject.message = "Future Status of user updated successfully.";
        statusCode = 200;
      } else {
        statusCode = 201;
        responseObject.message = "User Status created successfully.";
      }
      return res.status(statusCode).json(responseObject);
    }
    return res.boom.badImplementation("The User doesn't exist.");
  } catch (err) {
    // @ts-ignore
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
  console.log("Abc")
  try {
    const data = await updateAllUserStatusModel();
    return res.status(200).json({
      message: "All User Status updated successfully.",
      data,
    });
  } catch (err) {
    // @ts-ignore
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

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

const deleteUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUserStatus = await deleteUserStatusModel(userId);
    const responseObj = { id: deletedUserStatus.id, userId, message: null };
    let statusCode: number;
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

const getAllUserStatus = async (req, res) => {
  const limit = parseInt(req.query.size) || 10;
  const lastDocId = req.query.next;

  try {
    const { allUserStatus, lastDocId: nextLastDocId } = await getAllUserStatusModel(req.query, limit, lastDocId);

    // Construct the next page URL
    const nextPageUrl = allUserStatus.length === limit ? `${req.baseUrl}${req.path}?next=${nextLastDocId}&size=${limit}${req.query.state ? `&state=${req.query.state}` : ''}` : null;

    return res.json({
      message: "All User Status found successfully.",
      totalUserStatus: allUserStatus.length,
      pageSize: limit,
      nextPageLink: nextPageUrl,
      allUserStatus: allUserStatus,
    });
  } catch (err) {
    logger.error(`Error while fetching all the User Status: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const cancelOOOStatus = async (req, res) => {
  let userId: string = req.params.userId;
  try {
    const responseObject = await cancelOooStatus(userId);
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

const updateUserStatusController = async (req, res) => {
  if (Object.keys(req.body).includes(CANCEL_OOO)) {
    await cancelOOOStatus(req, res);
  } else {
    await updateUserStatus(req, res);
  }
};


export default {
  getUserStatus,
  updateAllUserStatus,
  batchUpdateUsersStatus,
  deleteUserStatus,
  getAllUserStatus,
  updateUserStatusController
};
