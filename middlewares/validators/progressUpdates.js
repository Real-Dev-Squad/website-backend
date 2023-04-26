const Joi = require("joi");

const validateMarkBody = async (req, res, next) => {
  const schema = Joi.object({
    monitor: Joi.boolean().required(),
    frequency: Joi.number().integer().required(),
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating markTask payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateProgressBody = async (req, res, next) => {
  const schema = Joi.object({
    timestamp: Joi.string().required(),
    progress: Joi.string().required(),
    plan: Joi.string().required(),
    blockers: Joi.string().required(),
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating SaveProgress payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateMarkBody,
  validateProgressBody,
};
