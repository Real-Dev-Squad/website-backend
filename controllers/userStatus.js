const userStatusModel = require("../models/userStatus");
const { getUserIdBasedOnRoute } = require("../utils/userStatus");

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
 * Returns sorted user status on the basis of how long they have had that status for and updates user's from field
 *
 * @param req {Object} - All user object
 */

const getSortedUsers = (allUsers) => {
  const sorted = allUsers.sort((a, b) => a.currentStatus.from - b.currentStatus.from);
  const today = new Date();
  sorted.forEach((data) => {
    const idleSincedate = new Date(data.currentStatus.from);
    const dateArray = idleSincedate.toISOString().split("-");
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const yy = parseInt(dateArray[0]);
    const mm = parseInt(dateArray[1]);
    const dd = parseInt(dateArray[2]);
    let years, months;
    // months
    months = month - mm;
    if (day < dd) {
      months = months - 1;
    }
    // years
    years = year - yy;
    if (month * 100 + day < mm * 100 + dd) {
      years = years - 1;
      months = months + 12;
    }
    // days
    const days = Math.floor(
      (today.getTime() - new Date(yy + years, mm + months - 1, dd).getTime()) / (24 * 60 * 60 * 1000)
    );
    //
    data.currentStatus.from = `${years} years , ${months} months , ${days} days`;
  });
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
    if (req.query.sorted) {
      getSortedUsers(allUserStatus);
    }
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
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus };
