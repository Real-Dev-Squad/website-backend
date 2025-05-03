import Joi from "joi";

const validateMillisecondsTimestamp = async (reqBody, timestampProperty) => {
  const schema = Joi.object({
    [timestampProperty]: Joi.number().unit("milliseconds").required(),
  });
  return schema.validateAsync(reqBody);
};

export { validateMillisecondsTimestamp };
