const joi = require("joi");
const { DINERO, NEELAM } = require("../../constants/wallets");
const { TASK_STATUS, TASK_STATUS_OLD, MAPPED_TASK_STATUS } = require("../../constants/tasks");

const TASK_STATUS_ENUM = Object.values(TASK_STATUS);
const MAPPED_TASK_STATUS_ENUM = Object.keys(MAPPED_TASK_STATUS);

const createTask = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required(),
      purpose: joi.string().optional(),
      featureUrl: joi.string().optional(),
      type: joi.string().required(),
      links: joi.array().items(joi.string()).optional(),
      startedOn: joi.number().optional(),
      endsOn: joi.number().optional(),
      status: joi
        .string()
        .valid(...TASK_STATUS_ENUM)
        .required(),
      assignee: joi.string().optional(),
      priority: joi.string().required(),
      percentCompleted: joi.number().required(),
      dependsOn: joi.array().items(joi.string()).optional(),
      participants: joi.array().items(joi.string()).optional(),
      category: joi.string().optional(),
      level: joi.number().optional(),
      completionAward: joi
        .object()
        .keys({
          [DINERO]: joi.number().optional(),
          [NEELAM]: joi.number().optional(),
        })
        .optional(),
      lossRate: joi
        .object()
        .keys({
          [DINERO]: joi.number().optional(),
          [NEELAM]: joi.number().optional(),
        })
        .optional(),
      isNoteworthy: joi.bool().optional(),
      isCollapsed: joi.bool().optional(),
      github: joi
        .object()
        .keys({
          issue: joi.object().keys({
            status: joi.string().optional(),
            assignee: joi.string().optional(),
            id: joi.number().optional(),
            closedAt: joi.string().optional(),
          }),
        })
        .optional(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createTask payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateTask = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().optional(),
      purpose: joi.string().optional(),
      featureUrl: joi.string().optional(),
      type: joi.string().optional(),
      links: joi.array().items(joi.string()).optional(),
      endsOn: joi.number().optional(),
      startedOn: joi.number().optional(),
      category: joi.string().optional(),
      level: joi.number().optional(),
      status: joi
        .string()
        .valid(...TASK_STATUS_ENUM, ...Object.values(TASK_STATUS_OLD))
        .optional(),
      assignee: joi.string().optional(),
      percentCompleted: joi.number().integer().min(0).max(100).optional(),
      dependsOn: joi.array().items(joi.string()).optional(),
      participants: joi.array().items(joi.string()).optional(),
      completionAward: joi
        .object()
        .keys({
          [DINERO]: joi.number().optional(),
          [NEELAM]: joi.number().optional(),
        })
        .optional(),
      lossRate: joi
        .object()
        .keys({
          [DINERO]: joi.number().optional(),
          [NEELAM]: joi.number().optional(),
        })
        .optional(),
      isNoteworthy: joi.bool().optional(),
      isCollapsed: joi.bool().optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateTask payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateSelfTask = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      status: joi
        .string()
        .valid(...TASK_STATUS_ENUM, ...Object.values(TASK_STATUS_OLD))
        .optional(),
      percentCompleted: joi.number().integer().min(0).max(100).optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateSelfTask payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const getTasksValidator = async (req, res, next) => {
  const schema = joi.object().keys({
    dev: joi.bool().optional().sensitive(),
    status: joi
      .string()
      .insensitive()
      .valid(...MAPPED_TASK_STATUS_ENUM)
      .optional(),
    page: joi.number().integer().min(0),
    next: joi
      .string()
      .optional()
      .when("page", {
        is: joi.exist(),
        then: joi.custom((_, helpers) => helpers.message("Both next and page cannot be passed")),
      }),
    prev: joi
      .string()
      .optional()
      .when("page", {
        is: joi.exist(),
        then: joi.custom((_, helpers) => helpers.message("Both prev and page cannot be passed")),
      })
      .concat(
        joi.when("next", {
          is: joi.exist(),
          then: joi.custom((_, helpers) => helpers.message("Both prev and next cannot be passed")),
        })
      ),
    size: joi.number().integer().positive().min(1).max(100).optional(),
    q: joi
      .string()
      .optional()
      .custom((value, helpers) => {
        if (value && value.includes(":")) {
          const [key] = value.split(":");
          const allowedKeywords = ["searchterm"];
          if (!allowedKeywords.includes(key.toLowerCase())) {
            return helpers.error("any.invalid");
          }
        }
        return value;
      }, "Invalid query format"),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating getTasks query : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createTask,
  updateTask,
  updateSelfTask,
  getTasksValidator,
};
