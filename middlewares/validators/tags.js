const Joi = require("joi");
const { TYPES } = require("../../constants/tags");

const createTag = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    type: Joi.string()
      .uppercase()
      .custom((value, helper) => {
        if (!TYPES.includes(value)) return helper.message("Not a valid type");
        return value;
      }),

    createdBy: Joi.string().required(),
    date: Joi.date().required(),
    reason: Joi.string().exist(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createChallenge payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createTag,
};
