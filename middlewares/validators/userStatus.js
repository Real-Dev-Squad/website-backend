const joi = require("joi");
const { userState } = require("../../constants/userStatus");

const validateUpdatedUserStatus = async (req, res, next) => {
  const schema = joi
    .object({
      currentStatus: joi.object().keys({
        state: joi.string().trim().valid(userState.IDLE, userState.ACTIVE, userState.OOO),
        updatedAt: joi.number().required().strict(),
        from: joi.number().required().strict(),
        until: joi
          .any()
          .when("state", { is: userState.OOO, then: joi.number().required().strict(), otherwise: joi.optional() }),
        message: joi.any().when("state", {
          is: [userState.IDLE, userState.OOO],
          then: joi.string().required(),
          otherwise: joi.optional(),
        }),
      }),
      monthlyHours: joi.object().keys({
        committed: joi.number().required().strict(),
        updatedAt: joi.number().required().strict(),
      }),
    })
    .or("currentStatus", "monthlyHours");

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating UserStatus ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateUpdatedUserStatus,
};
