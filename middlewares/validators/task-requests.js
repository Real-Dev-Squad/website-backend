import { GITHUB_URL } from "../../constants/urls";
const joi = require("joi");
const { RQLQueryParser } = require("../../utils/RQLParser");
const githubOrg = config.get("githubApi.org");
const githubBaseUrl = config.get("githubApi.baseUrl");
// eslint-disable-next-line security/detect-non-literal-regexp
const githubIssuerUrlPattern = new RegExp(`^${githubBaseUrl}/repos/${githubOrg}/.+/issues/\\d+$`);
// eslint-disable-next-line security/detect-non-literal-regexp
const githubIssueHtmlUrlPattern = new RegExp(`^${GITHUB_URL}/${githubOrg}/.+/issues/\\d+$`); // Example: https://github.com/Real-Dev-Squad/website-status/issues/1050
const { TASK_REQUEST_STATUS, TASK_REQUEST_TYPE } = require("../../constants/taskRequests");

const postTaskRequests = async (req, res, next) => {
  const taskAssignmentSchema = joi
    .object()
    .strict()
    .keys({
      taskId: joi.string().required(),
      externalIssueUrl: joi.string().regex(githubIssuerUrlPattern).optional(),
      externalIssueHtmlUrl: joi.string().regex(githubIssueHtmlUrlPattern),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.ASSIGNMENT).required(),
      userId: joi.string().required(),
      proposedStartDate: joi.number().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
      markdownEnabled: joi.boolean().optional(),
    });

  const taskCreationSchema = joi
    .object()
    .strict()
    .keys({
      externalIssueUrl: joi.string().regex(githubIssuerUrlPattern).required(),
      externalIssueHtmlUrl: joi.string().regex(githubIssueHtmlUrlPattern).required(),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.CREATION).required(),
      userId: joi.string().required(),
      proposedStartDate: joi.number().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
      markdownEnabled: joi.boolean().optional(),
    });
  const schema = joi.alternatives().try(taskAssignmentSchema, taskCreationSchema);

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating postTaskRequests payload : ${error}`);
    res.boom.badRequest(error.details[0].context.message);
  }
};

const getTaskRequests = async (req, res, next) => {
  const queryParamsSchema = joi
    .object()
    .keys({
      dev: joi.bool().optional().sensitive(),
      prev: joi.string().optional(),
      next: joi.string().optional(),
      size: joi.number().integer().positive().min(1).max(100).optional(),
      q: joi.string().optional(),
    })
    .without("prev", "next")
    .with("prev", "size")
    .with("next", "size");

  const filtersSchema = joi.object().keys({
    status: joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.values(TASK_REQUEST_STATUS).map((value) => value.toLowerCase())),
          operator: joi.string().optional(),
        })
      )
      .optional(),
    "request-type": joi
      .array()
      .items(
        joi.object().keys({
          value: joi.string().valid(...Object.values(TASK_REQUEST_TYPE).map((value) => value.toLowerCase())),
          operator: joi.string().optional(),
        })
      )
      .optional(),
  });

  const sortSchema = joi.object().keys({
    created: joi.string().valid("asc", "desc").optional(),
    requestors: joi.string().valid("asc", "desc").optional(),
  });
  try {
    const { q: queryString } = req.query;
    const rqlQueryParser = new RQLQueryParser(queryString);

    await Promise.all([
      filtersSchema.validateAsync(rqlQueryParser.getFilterQueries()),
      sortSchema.validateAsync(rqlQueryParser.getSortQueries()),
      queryParamsSchema.validateAsync(req.query),
    ]);
    next();
  } catch (error) {
    logger.error(`Error validating get task requests payload : ${error}`);
    res.boom.badRequest(error?.details?.[0]?.message || error?.message);
  }
};
module.exports = {
  getTaskRequests,
  postTaskRequests,
};
