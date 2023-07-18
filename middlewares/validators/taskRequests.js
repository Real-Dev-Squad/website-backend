const joi = require("joi");

const createTaskRequest = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    taskId: joi.string().required(),
    userId: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error creating TaskRequest : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateTaskRequest = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    taskRequestId: joi.string().required(),
    userId: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error updating TaskRequest : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createTaskRequest,
  updateTaskRequest,
};
