const joi = require("joi");
const { ETA_EXTENSION_REQUEST_STATUS } = require("../../constants/extensionRequest");

const ETA_EXTENSION_REQUEST_STATUS_ENUM = Object.values(ETA_EXTENSION_REQUEST_STATUS);

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
      status: joi
        .string()
        .valid(...ETA_EXTENSION_REQUEST_STATUS_ENUM)
        .required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createExtensionRequest payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createExtensionRequest,
};
