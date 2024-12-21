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

export const validateGenerateInviteForUserBody = async (req, res, next) => {
  const schema = Joi.object().strict().keys({
    purpose: Joi.string().trim(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating invite creation payload: ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

module.exports = {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
  validateGenerateInviteForUserBody,
};
