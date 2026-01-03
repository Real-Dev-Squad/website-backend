const Joi = require("joi");
const { validateMillisecondsTimestamp } = require("./utils");

const validateGroupRoleBody = async (req, res, next) => {
  const schema = Joi.object({
    rolename: Joi.string().trim().required(),
    description: Joi.string().trim(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createGroupRole payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateGroupRoleUpdateBody = async (req, res, next) => {
  const schema = Joi.object({
    rolename: Joi.string().trim(),
    description: Joi.string().trim(),
  }).or("rolename", "description");

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateGroupRole payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
const validateMemberRoleBody = async (req, res, next) => {
  const schema = Joi.object({
    userid: Joi.string().trim().required(),
    roleid: Joi.string().trim().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating member role payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateUpdateUsersNicknameStatusBody = async (req, res, next) => {
  try {
    await validateMillisecondsTimestamp(req.body, "lastNicknameUpdate");
    next();
  } catch (error) {
    logger.error(`Error while validating request body for update users nickname status payload : ${error}`);
    res.boom.badRequest(error);
  }
};
/**
 * Middleware: Validates lazy loading parameters in the request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validateLazyLoadingParams = async (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(0).optional(),
    size: Joi.number().integer().min(1).max(100).optional(),
    dev: Joi.string().valid("true").optional(),
  });

  try {
    req.query = await schema.validateAsync(req.query);
    next();
  } catch (error) {
    res.boom.badRequest(error.message);
  }
};

module.exports = {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateLazyLoadingParams,
  validateUpdateUsersNicknameStatusBody,
  validateGroupRoleUpdateBody,
};
