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
    if (deletedUserStatus.userStatusExisted) {
      return res.status(200).json({
        id: deletedUserStatus.id,
        userId,
        message: "UserStatus Deleted successfully.",
      });
    } else {
      return res.status(404).json({
        id: deletedUserStatus.id,
        userId,
        message: "Could not find the user status linked to the user for deletion.",
      });
    }
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
    if (userData.userStatusExists) {
      return res.json({ message: "User Status found successfully", ...userData });
    } else {
      return res.status(404).json({ message: "User Status could not be found", ...userData });
    }
  } catch (err) {
    logger.error(`Error while fetching the User Status: ${err}`);
    return res.boom.notFound("The user Status could not be found as an internal server error occurred.");
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
      message: "All User Status found successfully",
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
    if (updateStatus.userStatusExists) {
      if (updateStatus.userStatusUpdated) {
        return res.status(200).json({
          id: updateStatus.id,
          userId,
          message: "userStatus updated successfully",
          ...dataToUpdate,
        });
      }
    } else {
      if (updateStatus.userStatusUpdated) {
        return res.status(201).json({
          id: updateStatus.id,
          userId,
          message: "User Status created successfully",
          ...dataToUpdate,
        });
      } else {
        return res.status(400).json({
          id: updateStatus.id,
          userId,
          message: "User Status couldn't be created as the request body is incomplete.",
        });
      }
    }
  } catch (err) {
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
  return res.status(400).json({
    id: undefined,
    userId: req.params.userId,
    message: "userStatus could not be updated.",
  });
};

module.exports = { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus };
