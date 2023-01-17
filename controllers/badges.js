const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/badges");
const { CONTROLLERS: CONTROLLERS_ERROR_MESSAGES } = ERROR_MESSAGES;
const { CONTROLLERS: CONTROLLERS_SUCCESS_MESSAGES } = SUCCESS_MESSAGES;
const badgeQuery = require("../models/badges");
const { fetchUser } = require("../models/users");
const imageService = require("../services/imageService");

/**
 * Get badges data
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <badges: Array<badge>, message: string> - Returns badges
 */
const getBadges = async (req, res) => {
  try {
    const allBadges = await badgeQuery.fetchBadges(req.query);
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.GET_BADGES,
      badges: allBadges,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.GET_BADGES}: ${error}`);
    return res.boom.badRequest(CONTROLLERS_ERROR_MESSAGES.GET_BADGES);
  }
};

/**
 * Get user badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <badges: Array<badge>, message: string> - Return user badges
 */
async function getUserBadges(req, res) {
  try {
    const userId = req.params.id;
    const { badges } = await badgeQuery.fetchUserBadges(userId);
    return res.json({ message: CONTROLLERS_SUCCESS_MESSAGES.GET_USER_BADGES, badges });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.GET_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.GET_USER_BADGES}: ${error?.message}`);
  }
}

/**
 * Create new badge
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <badge, message: string> - Return badge object
 */
async function postBadge(req, res) {
  try {
    const { file } = req;
    const { imageUrl } = await imageService.uploadBadgeImage({ file, badgeName: req.body.name });
    const badge = await badgeQuery.createBadge({
      ...req.body,
      imageUrl,
    });
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.POST_BADGE,
      badge,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.POST_BADGE}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.POST_BADGE}: ${error?.message}`);
  }
}

/**
 * Assign badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <message: string> - badges assigned
 */
// INFO: badgeIds are not validated, hence user can be assigned same badge multiple times
// TODO: add check for isBadgeIdExsist
async function postUserBadges(req, res) {
  try {
    const { badgeIds, userId } = req.body;
    const { userExists } = await fetchUser({ userId });
    if (!userExists) {
      throw Error(ERROR_MESSAGES.misc.userIdDoesNotExist);
    }
    await badgeQuery.assignBadges({ userId, badgeIds });
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.POST_USER_BADGES,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.POST_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.POST_USER_BADGES}: ${error?.message}`);
  }
}

/**
 * Unassign badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <message: string> - badges unassigned
 */
async function deleteUserBadges(req, res) {
  try {
    const { badgeIds, userId } = req.body;
    await badgeQuery.unAssignBadges({ userId, badgeIds });
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.DELETE_USER_BADGES,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.DELETE_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.DELETE_USER_BADGES}: ${error?.message}`);
  }
}

module.exports = {
  getBadges,
  getUserBadges,
  postBadge,
  postUserBadges,
  deleteUserBadges,
};
