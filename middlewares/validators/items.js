const Joi = require("joi");

const { TYPES } = require("../../constants/items");

const itemTagValidationSchema = Joi.object({
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

module.exports = {
  itemTagPayload: itemTagValidationSchema,
};
