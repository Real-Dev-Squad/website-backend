const joi = require("joi");
const { VALID_PROGRESS_TYPES, PROGRESS_VALID_SORT_FIELDS } = require("../../constants/progresses");

const validateCreateProgressRecords = async (req, res, next) => {
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

const validateGetProgressRecordsQuery = async (req, res, next) => {
  const schema = joi
    .object({
      type: joi
        .string()
        .valid(...VALID_PROGRESS_TYPES)
        .optional()
        .messages({
          "any.only": "Type field is restricted to either 'user' or 'task'.",
        }),
      userId: joi.string().optional().allow("").messages({
        "string.base": "userId must be a string",
      }),
      taskId: joi.string().optional().allow("").messages({
        "string.base": "taskId must be a string",
      }),
      orderBy: joi
        .string()
        .optional()
        .valid(...PROGRESS_VALID_SORT_FIELDS)
        .messages({
          "string.base": "orderBy must be a string",
        }),
      dev: joi.boolean().optional().messages({
        "any.only": "dev field is restricted to either 'true' or 'false'",
      }),
      size: joi
        .string()
        .optional()
        .pattern(/^[1-9]\d?$|^100$/)
        .messages({
          "string.empty": "size must contain value in range 1-100",
          "string.pattern.base": "size must be in range 1-100",
        }),
      page: joi
        .string()
        .optional()
        .pattern(/^0$|^[1-9]\d*$/)
        .messages({
          "string.empty": "page must contain a positive number or zero",
          "string.pattern.base": "page value either be a positive number or zero",
        }),
    })
    .xor("type", "userId", "taskId")
    .messages({
      "object.unknown": "Invalid field provided.",
      "object.xor": "Only one of type, userId, or taskId should be present",
    });
  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateGetRangeProgressRecordsParams = async (req, res, next) => {
  const schema = joi
    .object({
      userId: joi.string().optional(),
      taskId: joi.string().optional(),
      startDate: joi.date().iso().required(),
      endDate: joi.date().iso().min(joi.ref("startDate")).required(),
    })
    .xor("userId", "taskId")
    .messages({
      "object.unknown": "Invalid field provided.",
      "object.missing": "Either userId or taskId is required.",
      "object.xor": "Only one of userId or taskId should be present",
      "any.required": "Start date and End date is mandatory.",
      "date.min": "EndDate must be on or after startDate",
    });
  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateGetDayProgressParams = async (req, res, next) => {
  const schema = joi.object({
    type: joi
      .string()
      .valid(...VALID_PROGRESS_TYPES)
      .required()
      .messages({
        "any.only": "Type field is restricted to either 'user' or 'task'.",
      }),
    typeId: joi.string().required(),
    date: joi.date().iso().required(),
  });
  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
module.exports = {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
  validateGetDayProgressParams,
};
