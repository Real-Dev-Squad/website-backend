const joi = require("joi");
const { TASK_REQUEST_TYPE } = require("../../constants/taskRequests");

const postTaskRequests = async (req, res, next) => {
  const taskAssignmentSchema = joi
    .object()
    .strict()
    .keys({
      taskId: joi.string().required(),
      externalIssueId: joi.string().optional(),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.ASSIGNMENT).required(),
      userId: joi.string().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
    });

  const taskCreationSchema = joi
    .object()
    .strict()
    .keys({
      externalIssueId: joi.string().required(),
      requestType: joi.string().valid(TASK_REQUEST_TYPE.CREATION).required(),
      userId: joi.string().required(),
      proposedDeadline: joi.number().required(),
      description: joi.string().optional(),
    });
  const schema = joi.alternatives().try(taskAssignmentSchema, taskCreationSchema);

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating postTaskRequests payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  postTaskRequests,
};
