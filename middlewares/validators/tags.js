const Joi = require("joi");
const { TYPES } = require("../../constants/tags");

const tagValidationSchema = Joi.object({
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

module.exports = {
  tagSchema: tagValidationSchema,
};
