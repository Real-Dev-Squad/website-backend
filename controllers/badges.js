const badgeQuery = require("../models/badges");
const { fetchUser } = require("../models/users");
const imageService = require("../services/imageService");

/**
 * Get badges data
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Array} - Return badges
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

const getUserBadgeIds = async (req, res) => {
  try {
    const { userExists, badgeIds } = await badgeQuery.fetchUserBadgeIds(req.params.username);
    let responseMsg = "";
    if (userExists) {
      responseMsg = badgeIds.length !== 0 ? "User badges returned successfully!" : "This user does not have any badges";
      return res.json({ message: responseMsg, badgeIds });
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
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object} - Return badge object if formdata is valid
 */
async function postBadge(req, res) {
  try {
    const { file } = req;
    const { name, description, createdBy } = req.body;
    const { url } = await imageService.uploadBadgeImage({ file, badgeName: name });
    const { id, createdAt } = await badgeQuery.createBadge({ name, description, createdBy, imageUrl: url });
    return res.json({
      message: "Badge created successfully.",
      id,
      url,
      name,
      description,
      createdBy,
      createdAt,
    });
  } catch (error) {
    logger.error(`Error while creating badge: ${error}`);
    return res.boom.badRequest(`Failed to create badge: ${error?.message}`);
  }
}

/**
 * Assign badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {message} - badges assigned
 */
async function postUserBadges(req, res) {
  try {
    const { username } = req.params;
    const { badgeIds } = req.body;
    const result = await fetchUser({ username });
    if (!result.userExists) {
      throw new Error("Failed to assign badges, user does not exsit");
    }
    const userId = result.user.id;
    await badgeQuery.assignBadges({ userId, badgeIds });
    return res.json({
      message: "Badges assigned successfully.",
    });
  } catch (error) {
    logger.error(`Error while assigning badge: ${error}`);
    return res.boom.badRequest(`Failed to assign badges: ${error?.message}`);
  }
}

/**
 * Unassign badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {message} - badges unassigned
 */
async function deleteUserBadges(req, res) {
  try {
    const { username } = req.params;
    const { badgeIds } = req.body;
    const result = await fetchUser({ username });
    if (!result.userExists) {
      throw new Error("Failed to assign badges, user does not exsit");
    }
    const userId = result.user.id;
    await badgeQuery.unAssignBadges({ userId, badgeIds });
    return res.json({
      message: "Badges un-assigned successfully.",
    });
  } catch (error) {
    logger.error(`Error while unassigning badge: ${error}`);
    return res.boom.badRequest(`Failed to unassign badges: ${error?.message}`);
  }
}

module.exports = {
  getBadges,
  getUserBadgeIds,
  postBadge,
  postUserBadges,
  deleteUserBadges,
};
