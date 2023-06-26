const joi = require("joi");

const validateAuthStatus = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      authorization_status: joi.string().valid("AUTHORIZED", "REJECTED", "NOT_INIT").optional(),
    });

  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    logger.error(`Error updating auth status ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateAuthStatus,
};
