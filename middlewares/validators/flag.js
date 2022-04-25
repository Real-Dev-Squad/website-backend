const joi = require("joi");

const addFeatureFlag = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required(),
      enabled: joi.boolean().required(),
      roles: joi.array().items(joi.string()).required(),
      users: joi.object().required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating Feature Flag : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  addFeatureFlag,
};
