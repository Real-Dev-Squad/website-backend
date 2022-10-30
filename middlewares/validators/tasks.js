const joi = require("joi");
const { DINERO, NEELAM } = require("../../constants/wallets");
const { TASK_STATUS, TASK_STATUS_OLD } = require("../../constants/tasks");

const TASK_STATUS_ENUM = Object.values(TASK_STATUS);

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
      percentCompleted: joi.number().optional(),
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
      percentCompleted: joi.number().optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateSelfTask payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createTask,
  updateTask,
  updateSelfTask,
};
