const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/badges");
const { controllers: CONTROLLERS_ERROR_MESSAGES } = ERROR_MESSAGES;
const { controllers: CONTROLLERS_SUCCESS_MESSAGES } = SUCCESS_MESSAGES;
const badgeQuery = require("../models/badges");
const imageService = require("../services/imageService");
const { getUserId } = require("../utils/badges");

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
      message: CONTROLLERS_SUCCESS_MESSAGES.getBadges,
      badges: allBadges,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.getBadges}: ${error}`);
    return res.boom.badRequest(CONTROLLERS_ERROR_MESSAGES.getBadges);
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
    const userId = await getUserId(req.params.username);
    const { badges } = await badgeQuery.fetchUserBadges(userId);
    return res.json({ message: CONTROLLERS_SUCCESS_MESSAGES.getUserBadges, badges });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.getUserBadges}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.getUserBadges}: ${error?.message}`);
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
      message: CONTROLLERS_SUCCESS_MESSAGES.postBadge,
      badge,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.postBadge}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.postBadge}: ${error?.message}`);
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
    const { username } = req.params;
    const { badgeIds } = req.body;
    const userId = await getUserId(username);
    await badgeQuery.assignBadges({ userId, badgeIds });
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.postUserBadges,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.postUserBadges}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.postUserBadges}: ${error?.message}`);
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
    const { username } = req.params;
    const { badgeIds } = req.body;
    const userId = await getUserId(username);
    await badgeQuery.unAssignBadges({ userId, badgeIds });
    return res.json({
      message: CONTROLLERS_SUCCESS_MESSAGES.deleteUserBadges,
    });
  } catch (error) {
    logger.error(`${CONTROLLERS_ERROR_MESSAGES.deleteUserBadges}: ${error}`);
    return res.boom.badRequest(`${CONTROLLERS_ERROR_MESSAGES.deleteUserBadges}: ${error?.message}`);
  }
}

module.exports = {
  getBadges,
  getUserBadges,
  postBadge,
  postUserBadges,
  deleteUserBadges,
};
