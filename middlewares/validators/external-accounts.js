const joi = require("joi");

const externalAccountData = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    type: joi.string().required(),
    token: joi.string().required(),
    attributes: joi.object().strict().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating external account request payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = { externalAccountData };
