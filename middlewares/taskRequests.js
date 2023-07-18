const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const { userState } = require("../constants/userStatus");
const userModel = require("../models/users.js");
const userStatusModel = require("../models/userStatus.js");

/**
 * Validates user id for task request
 *
 * @param userId { string }: user id of the user
 */
async function validateUser(req, res, next) {
  try {
    const { userId } = req.body;
    const { userExists, user } = await userModel.fetchUser({ userId });
    if (!userExists) {
      return res.boom.conflict("User does not exist");
    }

    const { userStatusExists, data: userStatus } = await userStatusModel.getUserStatus(userId);
    if (!userStatusExists) {
      return res.boom.conflict("User status does not exist");
    }
    if (userStatus.currentStatus.state === userState.OOO) {
      return res.boom.conflict("User is currently OOO");
    }
    if (userStatus.currentStatus.state === userState.ACTIVE) {
      return res.boom.conflict("User is currently active on another task");
    }

    req.body.user = user;

    return next();
  } catch (err) {
    logger.error("Error while creating task request");
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
}

module.exports = {
  validateUser,
};
