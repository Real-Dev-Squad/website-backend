import joi from "joi";
import { ERROR_MESSAGES } from "../../constants/badges.js";
import logger from "../../utils/logger.js";

const { VALIDATORS } = ERROR_MESSAGES;
const { CREATE_BADGE, ASSIGN_OR_REMOVE_BADGES } = VALIDATORS;

/**
 * Validates the request payload for creating a new badge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
// eslint-disable-next-line consistent-return
const createBadge = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    imageUrl: joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.error(`Error validating badge: ${error}`);
    return res.boom.badRequest(CREATE_BADGE, {
      error: error.details[0].message,
    });
  }
  next();
};

/**
 * Validates the request payload for assigning or removing badges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
// eslint-disable-next-line consistent-return
const assignOrRemoveBadges = (req, res, next) => {
  const schema = joi.object({
    userId: joi.string().required(),
    badgeIds: joi.array().items(joi.string()).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.error(`Error validating badge assignment: ${error}`);
    return res.boom.badRequest(ASSIGN_OR_REMOVE_BADGES, {
      error: error.details[0].message,
    });
  }
  next();
};

export { assignOrRemoveBadges, createBadge };
