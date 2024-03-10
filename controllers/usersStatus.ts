import { getUserStatus as getUserStatusFromModel, updateUserStatus as updateUserStatusFromModel } from "../models/usersStatus";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Collects single User Status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getUserStatus = async (req: any, res: any) => {
  try {
    let userId: string;
    if (req.route.path === "/self") {
      userId = req.userData.id;
    } else {
      userId = req.params.userId;
    }
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
    let userId: string;
    if (req.route.path === "/self") {
      userId = req.userData.id;
    } else {
      userId = req.params.userId;
    }
    if (userId) {
      const dataToUpdate = {
        state: "CURRENT",
        ...req.body,
      };
      const updateStatus = await updateUserStatusFromModel(userId, dataToUpdate);
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

export default {
  getUserStatus,
  updateUserStatus
};
