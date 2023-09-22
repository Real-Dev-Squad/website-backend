const Joi = require("joi");

const validateGroupRoleBody = async (req, res, next) => {
  const schema = Joi.object({
    rolename: Joi.string().trim().required(),
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
  const schema = Joi.object({
    lastNicknameUpdate: Joi.alternatives().try(Joi.string().trim(), Joi.number().unit("milliseconds")).required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error while validating request body for update users nickname status payload : ${error}`);
    res.boom.badRequest(error);
  }
};

module.exports = {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
};
