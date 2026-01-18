const Joi = require("joi");

const { TYPES } = require("../../constants/items");

const validateItemsPayload = async (req, res, next) => {
  const schema = Joi.object({
    itemId: Joi.string().trim().required(),
    itemType: Joi.string()
      .uppercase()
      .custom((value, helper) => {
        if (!TYPES.includes(value)) return helper.message("Not a valid type");
        return value;
      }),

    tagPayload: Joi.array().items(
      Joi.object({
        tagId: Joi.string().required(),
        levelId: Joi.string().required(),
      })
    ),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating adding tags payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateItemQuery = async (req, res, next) => {
  const schema = Joi.object().strict().keys({
    itemType: Joi.string().uppercase().optional(),
    itemId: Joi.string().optional(),
    levelId: Joi.string().optional(),
    tagId: Joi.string().optional(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating query params : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateItemsPayload,
  validateItemQuery,
};
