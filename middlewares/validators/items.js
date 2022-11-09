const Joi = require("joi");

const { TYPES } = require("../../constants/items");

const validateItemsPayload = async (req, res, next) => {
  const schema = Joi.object({
    itemid: Joi.string().trim().required(),
    itemType: Joi.string()
      .uppercase()
      .custom((value, helper) => {
        if (!TYPES.includes(value)) return helper.message("Not a valid type");
        return value;
      }),

    tagPayload: Joi.array().items(
      Joi.object({
        tagid: Joi.string().required(),
        levelid: Joi.string().required(),
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

module.exports = {
  validateItemsPayload,
};
