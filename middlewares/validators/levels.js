const Joi = require("joi");

const levelValidationSchema = Joi.object({
  name: Joi.string().trim().required(),
  createdBy: Joi.string().required(),
  date: Joi.string().required(),
});

module.exports = {
  levelSchema: levelValidationSchema,
};
