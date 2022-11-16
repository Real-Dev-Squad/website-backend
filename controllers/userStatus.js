const userStatusModel = require("../models/userStatus");

/**
 * Creates a new User Status
 * @param req {object} - Express Request Object
 * @param res {object} - Express Response Object
 */

const addUserStatus = async (req, res) => {
  try {
    const { id, userStatusData } = await userStatusModel.addUserStatus({ ...req.body });
    return res.status(201).json({
      message: "User Status created successfully",
      id,
      ...userStatusData,
    });
  } catch (error) {
    logger.error(`Error while creating new User Status: ${error}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};
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
    return res.status(201).json({
      message: "UserStatus Deleted successfully.",
      ...deletedUserStatus,
    });
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
    const userData = await userStatusModel.getUserStaus(userId);
    return res.json({ message: "User Status found successfully", ...userData });
  } catch (err) {
    // can return 404 error as well
    logger.error(`Error while fetching the User Status: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
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
    const { allUserStatus } = await userStatusModel.getAllUserStaus();
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
    const data = await userStatusModel.updateUserStatus(userId, dataToUpdate);
    return res.json({
      message: "userStatus updated successfully",
      ...data,
    });
  } catch (err) {
    logger.error(`Error while updating the User Data: ${err}`);
    return res.boom.badImplementation("An internal server error occurred");
  }
};

module.exports = { addUserStatus, deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus };
