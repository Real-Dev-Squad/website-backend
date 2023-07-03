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
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  storeUserDeviceInfo,
};
