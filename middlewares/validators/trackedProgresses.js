const joi = require("joi");
const { VALID_PROGRESS_TYPES, TYPE_MAP } = require("../../constants/progresses");

// eslint-disable-next-line no-console
// const baseSchemaOrg = joi
//   .object()
//   .strict()
//   .keys({
//     type: joi
//       .string()
//       .trim()
//       .valid()
//       .required(...VALID_PROGRESS_TYPES)
//       .messages({
//         "any.required": "Required field 'type' is missing.",
//         "any.only": "Type field is restricted to either 'user' or 'task'.",
//       }),
//     currentlyTracked: joi.boolean().required().messages({
//       "any.required": "Required field 'currentlyTracked' is missing.",
//       "boolean.base": "currentlyTracked field must be a boolean value.",
//     }),
//     frequency: joi
//       .number()
//       .integer()
//       .positive()
//       .when("type", {
//         is: "user",
//         then: joi.number().equal(1).messages({
//           "number.equal": "'frequency' field must be equal to 1",
//         }),
//         otherwise: joi.optional(),
//       })
//       .messages({
//         "number.base": "'frequency' field must be a number",
//         "number.integer": "'frequency' field must be an integer",
//         "number.positive": "'frequency' field must be a positive integer",
//         "any.only": "'frequency' field must be equal to 1 for type 'user'",
//       }),
//     ...(req.body.type === "task"
//       ? {
//         taskId: joi.string().trim().required().messages({
//           "any.required": "Required field 'taskId' is missing.",
//           "string.trim": "taskId must not have leading or trailing whitespace",
//         }),
//       }
//       : {
//         userId: joi.string().trim().required().messages({
//           "any.required": "Required field 'userId' is missing.",
//           "string.trim": "userId must not have leading or trailing whitespace",
//         }),
//       }),
//   })
//   .messages({ "object.unknown": "Invalid field provided." });

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
    currentlyTracked: joi.boolean().required().messages({
      "any.required": "Required field 'currentlyTracked' is missing.",
      "boolean.base": "currentlyTracked field must be a boolean value.",
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
  const currentlyTrackedSchema = joi.object().keys({
    currentlyTracked: joi.boolean().required().messages({
      "boolean.base": "currentlyTracked field must be a boolean value.",
    }),
  });
  const createSchema = baseSchema.concat(currentlyTrackedSchema);
  try {
    await createSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateUpdateTrackedProgress = async (req, res, next) => {
  const currentlyTrackedSchema = joi.object().keys({
    currentlyTracked: joi.boolean().optional().messages({
      "boolean.base": "currentlyTracked field must be a boolean value.",
    }),
  });
  const updateSchema = baseSchema.concat(currentlyTrackedSchema);
  const { type, typeId } = req.params;
  const { currentlyTracked, frequency } = req.body;
  const updatedData = { type, [TYPE_MAP[type]]: typeId, currentlyTracked, frequency };
  try {
    await updateSchema.validateAsync(updatedData, { abortEarly: false });
    next();
  } catch (error) {
    logger.error(`Error validating payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
module.exports = {
  validateCreateTrackedProgressRecords,
  validateUpdateTrackedProgress,
};
