import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/badges.js";
import * as badgeQuery from "../models/badges.js";
import * as dataAccess from "../services/dataAccessLayer.js";
import * as imageService from "../services/imageService.js";
import logger from "../utils/logger.js";

/**
 * Get badges data
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <badges: Array<badge>, message: string> - Returns badges
 */
export const getBadges = async (req, res, next) => {
  try {
    const badges = await badgeQuery.fetchBadges({ size: 100, page: 0 });
    return res.json(badges);
  } catch (error) {
    logger.error("Error in getBadges: ", error);
    return next(error);
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
    return res.json({ message: SUCCESS_MESSAGES.CONTROLLERS.GET_USER_BADGES, badges });
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.CONTROLLERS.GET_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${ERROR_MESSAGES.CONTROLLERS.GET_USER_BADGES}: ${error?.message}`);
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
      message: SUCCESS_MESSAGES.CONTROLLERS.POST_BADGE,
      badge,
    });
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.CONTROLLERS.POST_BADGE}: ${error}`);
    return res.boom.badRequest(`${ERROR_MESSAGES.CONTROLLERS.POST_BADGE}: ${error?.message}`);
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
    const { userExists } = await dataAccess.retrieveUsers({ id: userId });
    if (!userExists) {
      throw Error(ERROR_MESSAGES.MISC.USER_ID_DOES_NOT_EXIST);
    }
    await badgeQuery.assignBadges({ userId, badgeIds });
    return res.json({
      message: SUCCESS_MESSAGES.CONTROLLERS.POST_USER_BADGES,
    });
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.CONTROLLERS.POST_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${ERROR_MESSAGES.CONTROLLERS.POST_USER_BADGES}: ${error?.message}`);
  }
}

/**
 * remove badges
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @returns {Object}: <message: string> - badges removed
 */
async function deleteUserBadges(req, res) {
  try {
    const { badgeIds, userId } = req.body;
    await badgeQuery.removeBadges({ userId, badgeIds });
    return res.json({
      message: SUCCESS_MESSAGES.CONTROLLERS.DELETE_USER_BADGES,
    });
  } catch (error) {
    logger.error(`${ERROR_MESSAGES.CONTROLLERS.DELETE_USER_BADGES}: ${error}`);
    return res.boom.badRequest(`${ERROR_MESSAGES.CONTROLLERS.DELETE_USER_BADGES}: ${error?.message}`);
  }
}

export const getBadgeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const badge = await badgeQuery.fetchBadges({ id });
    return res.json(badge);
  } catch (error) {
    logger.error("Error in getBadgeById: ", error);
    return next(error);
  }
};

export const createBadge = async (req, res, next) => {
  try {
    const badgeData = req.body;
    const badge = await badgeQuery.createBadge(badgeData);
    return res.json(badge);
  } catch (error) {
    logger.error("Error in createBadge: ", error);
    return next(error);
  }
};

export const deleteBadge = async (req, res, next) => {
  try {
    const { id } = req.params;
    await badgeQuery.removeBadges(id);
    return res.json({ message: SUCCESS_MESSAGES.CONTROLLERS.DELETE_USER_BADGES });
  } catch (error) {
    logger.error("Error in deleteBadge: ", error);
    return next(error);
  }
};
