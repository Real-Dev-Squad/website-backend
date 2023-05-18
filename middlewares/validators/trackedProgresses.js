const joi = require("joi");

const validateCreateTrackedProgressRecords = async (req, res, next) => {
  const baseSchema = joi
    .object()
    .strict()
    .keys({
      type: joi.string().trim().valid("user", "task").required().messages({
        "any.required": "Required field 'type' is missing.",
        "any.only": "Type field is restricted to either 'user' or 'task'.",
      }),
      currentlyTracked: joi.boolean().required().messages({
        "any.required": "Required field 'currentlyTracked' is missing.",
        "boolean.base": "currentlyTracked field must be a boolean value.",
      }),
      frequency: joi.number().integer().positive().required().messages({
        "any.required": "Required field 'frequency' is missing.",
        "number.base": "'frequency' field must be a number",
        "number.integer": "'frequency' field must be an integer",
        "number.positive": "'frequency' field must be a positive integer",
      }),
      ...(req.body.type === "task"
        ? {
            taskId: joi.string().trim().required().messages({
              "any.required": "Required field 'taskId' is missing.",
              "string.trim": "taskId must not have leading or trailing whitespace",
            }),
          }
        : {
            userId: joi.string().trim().required().messages({
              "any.required": "Required field 'userId' is missing.",
              "string.trim": "userId must not have leading or trailing whitespace",
            }),
          }),
    })
    .messages({ "object.unknown": "Invalid field provided." });

  try {
    await baseSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateCreateTrackedProgressRecords,
};
