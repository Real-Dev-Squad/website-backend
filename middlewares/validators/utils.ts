const Joi = require("joi");

const validateMillisecondsTimestamp = async (reqBody, timestampProperty) => {
  const schema = Joi.object({
    [timestampProperty]: Joi.number().unit("milliseconds").required(),
  });
  return schema.validateAsync(reqBody);
};

module.exports = {
  validateMillisecondsTimestamp
}
