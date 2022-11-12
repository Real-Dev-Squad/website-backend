const joi = require("joi");
const userStatusModel = require("../../models/userStatus");

const validateUserStatus = async (req, res, next) => {
  const schema = joi.object().keys({
    userId: joi.string().trim().required(),
    currentStatus: joi.object().keys({
      state: joi.string().trim().valid("ACTIVE", "IDLE", "OOO").required(),
      updatedAt: joi.number().required(),
      from: joi.number().required(),
      until: joi.number().optional(),
      message: joi.string().trim().required(),
    }),
    monthlyHours: joi.object().keys({
      committed: joi.number().required(),
      updatedAt: joi.number().required(),
    }),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating UserStatus payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validatePartialUserStatus = async (req, res, next) => {
  const dataToUpdate = req.body;
  const originalData = await userStatusModel.getUserStaus(req.params.userId);
  req.body = { ...originalData, ...dataToUpdate };
  next();
};

module.exports = {
  validateUserStatus,
  validatePartialUserStatus,
};
