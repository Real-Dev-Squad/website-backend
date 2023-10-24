const joi = require("joi");
const { TASK_REQUEST_TYPE } = require("../../constants/taskRequests");
const githubOrg = config.get("githubApi.org");
const githubBaseUrl = config.get("githubApi.baseUrl");
const githubIssuerUrlPattern = new RegExp(`^${githubBaseUrl}/repos/${githubOrg}/.+/issues/\\d+$`);

const postTaskRequests = async (req, res, next) => {
  const taskAssignmentSchema = joi
    .object()
    .strict()
    .keys({
      taskId: joi.string().required(),
      externalIssueUrl: joi.string().regex(githubIssuerUrlPattern).optional(),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.ASSIGNMENT).required(),
      userId: joi.string().required(),
      proposedStartDate: joi.number().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
    });

  const taskCreationSchema = joi
    .object()
    .strict()
    .keys({
      externalIssueUrl: joi.string().regex(githubIssuerUrlPattern).required(),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.CREATION).required(),
      userId: joi.string().required(),
      proposedStartDate: joi.number().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
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

module.exports = {
  postTaskRequests,
};
