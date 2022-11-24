const extensionRequests = require("../models/extensionRequests");

/**
 * Fetches all the extension requests of the logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const getSelfExtensionRequests = async (req, res) => {
  try {
    const { username } = req.userData;
    const { taskId } = req.query;

    if (username) {
      if (taskId) {
        const allTaskIdExtensionRequests = await extensionRequests.fetchUserExtensionRequests(username, [], taskId);
        return res.json(allTaskIdExtensionRequests);
      } else {
        const allExtensionRequests = await extensionRequests.fetchUserExtensionRequests(username);
        return res.json(allExtensionRequests);
      }
    }
    return res.boom.notFound("User doesn't exist");
  } catch (error) {
    logger.error(`Error while fetching extension requests: ${error}`);
    return res.boom.badImplementation("An internal server error occured");
  }
};

module.exports = {
  getSelfExtensionRequests,
};
