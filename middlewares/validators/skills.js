const joi = require("joi");

async function awardSkill(req, res, next) {
  const schema = joi.object().strict().keys({
    name: joi.string().required(),
    by: joi.string().required(),
    on: joi.string().optional(),
    for: joi.string().optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error("Error posting skill data: ", error);
    res.boom.badRequest(error.details[0].message);
  }
}

module.exports = { awardSkill };
