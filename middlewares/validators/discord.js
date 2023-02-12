const joi = require("joi");

const discordData = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    token: joi.string().required(),
    discordId: joi.string().required(),
    timestamp: joi.number().required(),
    expiry: joi.number().required(),
    linkStatus: joi.boolean().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating discord bot request payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = { discordData };
