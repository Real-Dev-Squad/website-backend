const joi = require("joi");

const validateFeatureFlag = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    name: joi.string().required(),
    title: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating featureFlag data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateFeatureFlags = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().optional(),
      config: joi
        .object()
        .strict()
        .keys({
          roleBased: joi
            .object()
            .strict()
            .keys({
              roles: joi.array().required(),
              active: joi.boolean().required(),
            })
            .optional(),
          percentage: joi
            .object()
            .strict()
            .keys({
              value: joi.number().required(),
              active: joi.boolean().required(),
            })
            .optional(),
          enabled: joi.boolean().optional(),
        })
        .optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating featureFlag data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateFeatureFlag,
  updateFeatureFlags,
};
