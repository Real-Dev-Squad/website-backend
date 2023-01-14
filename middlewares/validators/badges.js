const joi = require("joi");
const { ERROR_MESSAGES } = require("../../constants/badges");
const { validators: VALIDATORS_ERROR_MESSAGES } = ERROR_MESSAGES;
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
      throw new Error(VALIDATORS_ERROR_MESSAGES.createBadge.fileisMissing);
    }
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`${VALIDATORS_ERROR_MESSAGES.createBadge.validatonFailed}: ${error}`);
    res.boom.badRequest(
      `${VALIDATORS_ERROR_MESSAGES.apiPayloadValidationFailed}, ${error.details?.[0]?.message ?? error?.message}`
    );
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
      username: joi.string().required(),
      badgeIds: joi.array().min(1).items(joi.string().required()).unique().required(),
    });
  try {
    const { username } = req.params;
    const { badgeIds } = req.body;
    await schema.validateAsync({ username, badgeIds });
    next();
  } catch (error) {
    logger.error(`${VALIDATORS_ERROR_MESSAGES.assignOrUnassignBadges.validatonFailed}: ${error}`);
    res.boom.badRequest(`${VALIDATORS_ERROR_MESSAGES.apiPayloadValidationFailed}, ${error.details?.[0]?.message}`);
  }
}

module.exports = {
  createBadge,
  assignOrUnassignBadges,
};
