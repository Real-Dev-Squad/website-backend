const joi = require("joi");

const validateEmail = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    email: joi.string().email({ tlds: { allow: false } }),
    // reason to disable tlds: https://stackoverflow.com/questions/57972358/joi-email-validation
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(error);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateEmail,
};
