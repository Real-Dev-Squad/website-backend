const joi = require("joi");

const validateUserRoles = async (req, res, next) => {
  const config = {
    super_user: joi.boolean().optional(),
    member: joi.boolean().optional(),
  };
  const schema = joi.object(config).xor("super_user", "member");

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    logger.error(`Error validating validateUserRoles payload : ${err}`);
    res.boom.badRequest(JSON.stringify({ allowedParameters: { super_user: "boolean", member: "boolean" } }));
  }
};

module.exports = {
  validateUserRoles,
};
