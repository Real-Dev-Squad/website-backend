const badgeQuery = require("../models/badges");
const imageService = require("../services/imageService");

/**
 * Get badges data
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getBadges = async (req, res) => {
  try {
    const allBadges = await badgeQuery.fetchBadges(req.query);
    return res.json({
      message: "Badges returned successfully!",
      badges: allBadges,
    });
  } catch (error) {
    logger.error(`Error while fetching all badges: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

const getUserBadges = async (req, res) => {
  try {
    const result = await badgeQuery.fetchUserBadges(req.params.username);
    let responseMsg = "";
    if (result.userExists) {
      responseMsg =
        result.userBadges.length !== 0 ? "User badges returned successfully!" : "This user does not have any badges";
      return res.json({ message: responseMsg, userBadges: result.userBadges });
    } else {
      return res.boom.notFound("The user does not exist");
    }
  } catch (error) {
    logger.error(`Error while fetching all user badges: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

/**
 * Create new badge
 * 
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object} - Returns badge object if formdata is valid
 */
async function postBadge(req, res) {
  try {
    const {file} = req;
    const {name, description, createdBy} = req.body;
    const {url} = await imageService.uploadBadgeImage({file, name});
    const {createdAt} = await badgeQuery.addBadge({name, description, createdBy, url});
    return res.json({
      message: 'Badge created successfully!!',
      url,
      name,
      description,
      createdBy,
      createdAt
    })
  } catch (error) {
    logger.error(`Error while creating badge: ${error}`);
    return res.boom.badRequest("An internal server error occurred");
  }
}

async function postUserBadge(req, res) {
  try {
    // add code here
  } catch (error) {
    logger.error(`Error while assigning badge: ${error}`);
  }
}

async function deleteUserBadge(req, res) {
  try {
    // add code here
  } catch (error) {
    logger.error(`Error while unassigning badge: ${error}`);
  }
}

module.exports = {
  getBadges,
  getUserBadges,
  postBadge,
  postUserBadge,
  deleteUserBadge,
};
