const joi = require("joi");
const { EXTENSION_REQUEST_STATUS } = require("../../constants/extensionRequests");
const { parseQueryParams } = require("../../utils/queryParser");
const { BAD_REQUEST } = require("../../constants/errorMessages");

const ER_STATUS_ENUM = Object.values(EXTENSION_REQUEST_STATUS);

const createExtensionRequest = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      taskId: joi.string().required(),
      title: joi.string().optional(),
      assignee: joi.string().required(),
      oldEndsOn: joi.number().required(),
      newEndsOn: joi.number().required(),
      reason: joi.string().required(),
      status: joi.string().valid(EXTENSION_REQUEST_STATUS.PENDING).required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createExtensionRequest payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateExtensionRequestStatus = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      status: joi.string().valid(EXTENSION_REQUEST_STATUS.APPROVED, EXTENSION_REQUEST_STATUS.DENIED).required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateExtensionRequest payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateExtensionRequest = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    taskId: joi.string().optional(),
    title: joi.string().optional(),
    assignee: joi.string().optional(),
    oldEndsOn: joi.number().optional(),
    newEndsOn: joi.number().optional(),
    reason: joi.string().optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateExtensionRequest payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const getExtensionRequestsValidator = async (req, res, next) => {
  const schema = joi.object().keys({
    dev: joi.bool().optional().sensitive(),
    status: joi
      .alternatives()
      .try(joi.string().valid(...ER_STATUS_ENUM), joi.array().items(joi.string().valid(...ER_STATUS_ENUM)))
      .optional(),
    cursor: joi.string().optional(),
    order: joi.string().valid("asc", "desc").optional(),
    size: joi.number().integer().positive().min(1).max(100).optional(),
    assignee: joi.alternatives().try(joi.string(), joi.array().items(joi.string())).optional(),
    taskId: joi.alternatives().try(joi.string(), joi.array().items(joi.string())).optional(),
  });

  try {
    const queries = parseQueryParams(req._parsedUrl.search);
    if (!queries) {
      res.boom.badRequest(BAD_REQUEST);
      return;
    }
    await schema.validateAsync(queries);
    next();
  } catch (error) {
    logger.error(`Error validating fetch extension requests query : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createExtensionRequest,
  updateExtensionRequest,
  updateExtensionRequestStatus,
  getExtensionRequestsValidator,
};
