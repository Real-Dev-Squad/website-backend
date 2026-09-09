const Joi = require("joi");
const { validateMillisecondsTimestamp } = require("./utils");
const logger = require("../../utils/logger");

const validateGroupRoleBody = async (req, res, next) => {
  const bodySchema = Joi.object({
    rolename: Joi.string().trim().required(),
    description: Joi.string().trim(),
  });

  const querySchema = Joi.object({
    role: Joi.boolean().default(false).optional(),
  });

  try {
    await bodySchema.validateAsync(req.body);
    const validatedQuery = await querySchema.validateAsync(req.query);
    // Express 5 exposes req.query as a getter-only property that re-parses on
    // every access, so a plain assignment would be silently dropped. Define an
    // own property instead to propagate the validated/coerced values.
    Object.defineProperty(req, "query", {
      value: validatedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  } catch (error) {
    logger.error(`Error validating createGroupRole payload : ${error}`);
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
    const validatedQuery = await schema.validateAsync(req.query);
    // Express 5 exposes req.query as a getter-only property that re-parses on
    // every access, so a plain assignment would be silently dropped. Define an
    // own property instead to propagate the validated/coerced values.
    Object.defineProperty(req, "query", {
      value: validatedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
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
};
