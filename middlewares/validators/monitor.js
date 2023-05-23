const joi = require("joi");
const { VALID_PROGRESS_TYPES, TYPE_MAP } = require("../../constants/progresses");

const baseSchema = joi
  .object()
  .strict()
  .keys({
    type: joi
      .string()
      .trim()
      .valid(...VALID_PROGRESS_TYPES)
      .required()
      .messages({
        "any.required": "Required field 'type' is missing.",
        "any.only": "Type field is restricted to either 'user' or 'task'.",
      }),
    monitored: joi.boolean().required().messages({
      "any.required": "Required field 'monitored' is missing.",
      "boolean.base": "monitored field must be a boolean value.",
    }),
    frequency: joi
      .number()
      .integer()
      .positive()
      .when("type", {
        is: "user",
        then: joi.number().equal(1).messages({
          "number.equal": "'frequency' field must be equal to 1",
        }),
        otherwise: joi.optional(),
      })
      .messages({
        "number.base": "'frequency' field must be a number",
        "number.integer": "'frequency' field must be an integer",
        "number.positive": "'frequency' field must be a positive integer",
        "any.only": "'frequency' field must be equal to 1 for type 'user'",
      }),
    taskId: joi
      .string()
      .trim()
      .when("type", {
        is: "task",
        then: joi.required().messages({
          "any.required": "Required field 'taskId' is missing.",
          "string.trim": "taskId must not have leading or trailing whitespace",
        }),
        otherwise: joi.optional(),
      }),
    userId: joi
      .string()
      .trim()
      .when("type", {
        is: "user",
        then: joi.required().messages({
          "any.required": "Required field 'userId' is missing.",
          "string.trim": "userId must not have leading or trailing whitespace",
        }),
        otherwise: joi.optional(),
      }),
  })
  .messages({ "object.unknown": "Invalid field provided." });

const validateCreateTrackedProgressRecords = async (req, res, next) => {
  const monitoredSchema = joi.object().keys({
    monitored: joi.boolean().required().messages({
      "boolean.base": "monitored field must be a boolean value.",
    }),
  });
  const createSchema = baseSchema.concat(monitoredSchema);
  try {
    await createSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateUpdateTrackedProgress = async (req, res, next) => {
  const { type, typeId } = req.params;
  const { monitored, frequency } = req.body;
  const updatedData = { type, [TYPE_MAP[type]]: typeId, monitored, frequency };
  const monitoredSchema = joi.object().keys({
    monitored: joi.boolean().optional().messages({
      "boolean.base": "monitored field must be a boolean value.",
    }),
  });
  const updateSchema = baseSchema.concat(monitoredSchema).or("monitored", "frequency");
  try {
    await updateSchema.validateAsync(updatedData, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateGetTrackedProgressQueryParams = async (req, res, next) => {
  const schema = joi
    .object({
      type: joi.string().valid(...VALID_PROGRESS_TYPES),
      userId: joi.string(),
      taskId: joi.string(),
      monitored: joi.bool().optional(),
    })
    .xor("type", "userId", "taskId")
    .with("monitored", "type")
    .messages({
      "any.only": "Type field is restricted to either 'user' or 'task'.",
      "object.xor": "Invalid combination of request params.",
      "object.missing": "One of the following fields is required: type, userId, or taskId.",
      "object.unknown": "Invalid field provided.",
      "object.with": "The monitored param is missing a required field type.",
    });

  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateCreateTrackedProgressRecords,
  validateUpdateTrackedProgress,
  validateGetTrackedProgressQueryParams,
};
