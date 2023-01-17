const joi = require("joi");
const { ERROR_MESSAGES } = require("../../constants/badges");
const {
  VALIDATORS: { CREATE_BADGE, ASSIGN_OR_UNASSIGN_BADGES, API_PAYLOAD_VALIDATION_FAILED },
} = ERROR_MESSAGES;
const logger = require("../../utils/logger");

/**
 * Validates badge payload
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {function} - Express middelware
 */
async function createBadge(req, res, next) {
  const schema = joi
    .object()
    .strict()
    .keys({
      name: joi.string().min(3).max(30).required(),
      description: joi.string().min(3).max(130).optional(),
      createdBy: joi.string().min(1).required(),
    });
  try {
    // TODO: add strong file check
    if (!req.file) {
      throw new Error(CREATE_BADGE.FILE_IS_MISSING);
    }
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`${CREATE_BADGE.VALIDATON_FAILED}: ${error}`);
    res.boom.badRequest(`${API_PAYLOAD_VALIDATION_FAILED}, ${error.details?.[0]?.message ?? error?.message}`);
  }
}

/**
 * Validates param username and payload badgeIds
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {function} - Express middelware
 */
async function assignOrUnassignBadges(req, res, next) {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required(),
      badgeIds: joi.array().min(1).items(joi.string().required()).unique().required(),
    });
  try {
    const { badgeIds, userId } = req.body;
    await schema.validateAsync({ userId, badgeIds });
    next();
  } catch (error) {
    logger.error(`${ASSIGN_OR_UNASSIGN_BADGES.VALIDATON_FAILED}: ${error}`);
    res.boom.badRequest(`${API_PAYLOAD_VALIDATION_FAILED}, ${error.details?.[0]?.message}`);
  }
}

module.exports = {
  createBadge,
  assignOrUnassignBadges,
};
