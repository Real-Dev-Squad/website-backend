const Joi = require("joi");

const { TYPES } = require("../../constants/items");

const createItem = async (req, res, next) => {
  const schema = Joi.object({
    itemid: Joi.string().trim().required(),
    itemType: Joi.string()
      .uppercase()
      .custom((value, helper) => {
        if (!TYPES.includes(value)) return helper.message("Not a valid type");
        return value;
      }),

    tagPayload: Joi.array().custom((values, helper) => {
      for (const val of values) {
        if (val.length !== 2) return helper.message("tag payload is not valid");
      }
      return values;
    }),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createItem payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createItem,
};
