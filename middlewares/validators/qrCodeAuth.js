const joi = require("joi");

const storeUserDeviceInfo = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    user_id: joi.string().required(),
    device_info: joi.string().required(),
    device_id: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating newDeviceInfo payload : ${error}`);
  }
};

const validateAuthStatus = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      authorization_status: joi.string().valid("AUTHORIZED", "REJECTED", "NOT_INIT"),
    });

  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    logger.error(`Error updating auth status ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateFetchingUserDocument = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    device_id: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Invalid Query Parameters Passed`);
    res.boom.badRequest(`Invalid Query Parameters Passed`);
  }
};

const validateFetchingUserDeviceStatus = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    user_id: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Invalid Query Parameters Passed`);
    res.boom.badRequest(`Invalid Query Parameters Passed`);
  }
};

module.exports = {
  storeUserDeviceInfo,
  validateAuthStatus,
  validateFetchingUserDocument,
  validateFetchingUserDeviceStatus,
};
