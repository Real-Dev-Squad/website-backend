const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");
const dataAccess = require("../services/dataAccessLayer");
const { TASK_REQUEST_ACTIONS } = require("../constants/taskRequests");
/**
 * Validates user id for task request
 *
 * @param userId { string }: user id of the user
 */
async function validateUser(req, res, next) {
  try {
    const { action } = req.query;
    if (action === TASK_REQUEST_ACTIONS.REJECT) {
      return next();
    }
    const { userId } = req.body;

    if (!userId) {
      return res.boom.badRequest("userId not provided");
    }

    const { userExists, user } = await dataAccess.retrieveUsers({ id: userId });
    if (!userExists) {
      return res.boom.conflict("User does not exist");
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
