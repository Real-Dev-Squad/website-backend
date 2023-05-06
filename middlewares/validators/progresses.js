const joi = require("joi");

const validateProgresses = async (req, res, next) => {
  const baseSchema = joi
    .object()
    .strict()
    .keys({
      type: joi.string().trim().valid("user", "task").required().messages({
        "any.required": "Required field 'type' is missing.",
        "any.only": "Type field is restricted to either 'user' or 'task'.",
      }),
      completed: joi.string().trim().required().messages({
        "any.required": "Required field 'completed' is missing.",
        "string.trim": "completed must not have leading or trailing whitespace",
      }),
      planned: joi.string().trim().required().messages({
        "any.required": "Required field 'planned' is missing.",
        "string.trim": "planned must not have leading or trailing whitespace",
      }),
      blockers: joi.string().trim().allow("").required().messages({
        "any.required": "Required field 'blockers' is missing.",
        "string.trim": "blockers must not have leading or trailing whitespace",
      }),
    })
    .messages({ "object.unknown": "Invalid field provided." });

  const taskSchema = joi.object().keys({
    taskId: joi.string().trim().required().messages({
      "any.required": "Required field 'taskId' is missing.",
      "string.trim": "taskId must not have leading or trailing whitespace",
    }),
  });
  const schema = req.body.type === "task" ? baseSchema.concat(taskSchema) : baseSchema;

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateProgresses,
};
