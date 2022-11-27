const joi = require("joi");
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
      description: joi.string().min(3).max(130).required(),
      createdBy: joi.string().min(1).required(),
    });
  try {
    // TODO: add strong file check
    if (!req.file) {
      throw new Error("file is required");
    }
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createBadge payload: ${error}`);
    res.boom.badRequest(`API payload failed validation, ${error.details?.[0]?.message ?? error?.message}`);
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
    logger.error(`Error validating assign or unassign badges payload: ${error}`);
    res.boom.badRequest(`API payload failed validation, ${error.details?.[0]?.message}`);
  }
}

module.exports = {
  createBadge,
  assignOrUnassignBadges,
};
