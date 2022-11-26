const userStatusModel = require("../models/userStatus");

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
    return res.boom.badImplementation("An internal server error occurred");
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
    const { userId } = req.params;
    const userData = await userStatusModel.getUserStatus(userId);
    const { userStatusExists, id, data } = userData;
    let responseObject = { id, userId };
    if (data) responseObject = { ...responseObject, ...data };
    let statusCode;
    if (userStatusExists) {
      statusCode = 200;
      responseObject.message = "User Status found successfully.";
    } else {
      responseObject.message = "User Status couldn't be found.";
      statusCode = 404;
    }
    return res.status(statusCode).json(responseObject);
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
    return res.json({
      message: "All User Status found successfully.",
      totalUserStatus: allUserStatus.length,
      allUserStatus,
    });
  } catch (err) {
    logger.error(`Error while fetching all the User Status: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
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
    const { userId } = req.params;
    const dataToUpdate = req.body;
    const updateStatus = await userStatusModel.updateUserStatus(userId, dataToUpdate);
    const { userStatusExists, userStatusUpdated, id, data } = updateStatus;
    let responseObject = { id, userId };
    let statusCode;
    if (data) {
      responseObject = { ...responseObject, ...data };
    }
    if (userStatusExists) {
      responseObject.message = "User Status updated successfully.";
      statusCode = 200;
    } else {
      if (userStatusUpdated) {
        responseObject.message = "User Status created successfully.";
        statusCode = 201;
      } else {
        responseObject.message = "User Status couldn't be created due to incomplete request body.";
        statusCode = 400;
      }
    }
    return res.status(statusCode).json(responseObject);
  } catch (err) {
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus };
