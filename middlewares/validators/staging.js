const joi = require("joi");

const validateUserRoles = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    super_user: joi.boolean().optional(),
    member: joi.boolean().optional(),
    archive: joi.boolean().optional(),
    in_discord: joi.boolean().optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    logger.error(`Error validating validateUserRoles payload : ${err}`);
    res.boom.badRequest(JSON.stringify({ allowedParameters: { super_user: "boolean", member: "boolean" } }));
  }
};

const validateRevokePrivileges = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      action: joi.string().equal("revoke"),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    logger.error(`Error validating validateUserRoles payload : ${err}`);
    res.boom.badRequest(JSON.stringify({ allowedParameters: { action: "revoke" } }));
  }
};

module.exports = {
  validateUserRoles,
  validateRevokePrivileges,
};
