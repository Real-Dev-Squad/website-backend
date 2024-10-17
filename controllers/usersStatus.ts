import {
  getUserStatus as getUserStatusFromModel,
  updateUserStatus as updateUserStatusFromModel,
  updateAllUserStatus as updateAllUserStatusModel,
  batchUpdateUsersStatus as batchUpdateUsersStatusModel,
} from "../models/usersStatus";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Collects single User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStatus = async (req: any, res: any) => {
  try {
    let userId: string = req.params.userId;
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
    let userId: string = req.params.userId;
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

export default {
  getUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  batchUpdateUsersStatus,
};
