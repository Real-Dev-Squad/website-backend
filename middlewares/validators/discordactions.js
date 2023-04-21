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

module.exports = {
  validateGroupRoleBody,
};
