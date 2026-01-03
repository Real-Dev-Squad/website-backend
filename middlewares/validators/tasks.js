const joi = require("joi");
const { BadRequest } = require("http-errors");
const { DINERO, NEELAM } = require("../../constants/wallets");
const { TASK_STATUS, TASK_STATUS_OLD, MAPPED_TASK_STATUS, tasksUsersStatus } = require("../../constants/tasks");
const { RQLQueryParser } = require("../../utils/RQLParser");
const { Operators } = require("../../typeDefinitions/rqlParser");
const { daysOfWeek } = require("../../constants/constants");
const TASK_STATUS_ENUM = Object.values(TASK_STATUS);
const MAPPED_TASK_STATUS_ENUM = Object.keys(MAPPED_TASK_STATUS);
const { validateMillisecondsTimestamp } = require("./utils");

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
            html_url: joi.string().uri().optional(),
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
      endsOn: joi.alternatives().try(joi.number().optional(), joi.valid(null)),
      startedOn: joi.alternatives().try(joi.number().optional(), joi.valid(null)),
      category: joi.string().optional(),
      level: joi.number().optional(),
      status: joi
        .string()
        .valid(...TASK_STATUS_ENUM, ...Object.values(TASK_STATUS_OLD))
        .optional(),
      assignee: joi.alternatives().try(joi.string().optional(), joi.valid(null)),
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
  const validStatus = [...TASK_STATUS_ENUM, ...Object.values(TASK_STATUS_OLD)].filter(
    (item) => item !== TASK_STATUS.AVAILABLE
  );
  const schema = joi
    .object()
    .strict()
    .keys({
      status: joi
        .string()
        .valid(...validStatus)
        .optional()
        .error(new BadRequest(`The value for the 'status' field is invalid.`)),
      percentCompleted: joi.number().integer().min(0).max(100).optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateSelfTask payload : ${error}`);
    if (error instanceof BadRequest) {
      res.boom.badRequest(error.message);
    } else {
      res.boom.badRequest(error.details[0].message);
    }
  }
};

const getTasksValidator = async (req, res, next) => {
  const schema = joi.object().keys({
    status: joi
      .string()
      .insensitive()
      .valid(...MAPPED_TASK_STATUS_ENUM)
      .optional(),
    assignee: joi.string().insensitive().optional(),
    title: joi.string().insensitive().optional(),
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
    userFeatureFlag: joi.string().optional(),
    orphaned: joi.boolean().optional(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating getTasks query : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
const getUsersValidator = async (req, res, next) => {
  const queryParamsSchema = joi.object().keys({
    cursor: joi.string().optional(),
    q: joi.string().optional(),
    size: joi.number().integer().min(1).max(2000),
  });
  const filtersSchema = joi.object().keys({
    status: joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.values(tasksUsersStatus)),
          operator: joi.string().valid(Operators.INCLUDE),
        })
      )
      .required(),
    "days-count": joi
      .array()
      .items(
        joi.object().keys({
          value: joi.number().integer().min(1).max(10),
          operator: joi.string().valid(Operators.EXCLUDE),
        })
      )
      .max(1)
      .optional(),
    weekday: joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.keys(daysOfWeek)),
          operator: joi.string().valid(Operators.EXCLUDE),
        })
      )
      .max(7)
      .optional(),
    date: joi
      .array()
      .items(
        joi.object().keys({
          value: joi.date().timestamp(),
          operator: joi.string().valid(Operators.EXCLUDE),
        })
      )
      .max(20)
      .optional(),
  });

  try {
    const { q: queryString } = req.query;
    const rqlQueryParser = new RQLQueryParser(queryString);
    await Promise.all([
      queryParamsSchema.validateAsync(req.query),
      filtersSchema.validateAsync(rqlQueryParser.getFilterQueries()),
    ]);
    next();
  } catch (error) {
    logger.error(`Error validating get tasks for users query : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const filterOrphanTasksValidator = async (req, res, next) => {
  try {
    await validateMillisecondsTimestamp(req.body, "lastOrphanTasksFilterationTimestamp");
    next();
  } catch (error) {
    logger.error(`Error while validating request body for Orphan Tasks Filteration payload : ${error}`);
    res.boom.badRequest(error);
  }
};
module.exports = {
  createTask,
  updateTask,
  updateSelfTask,
  getTasksValidator,
  getUsersValidator,
  filterOrphanTasksValidator,
};
