const Joi = require("joi");
const { userState } = require("../../constants/userStatus");
const threeDaysInMilliseconds = 172800000;

const validateUpdatedUserStatus = async (req, res, next) => {
  const schema = Joi.object({
    currentStatus: Joi.object().keys({
      state: Joi.string().trim().valid(userState.IDLE, userState.ACTIVE, userState.OOO),
      updatedAt: Joi.number().required(),
      from: Joi.number().required(),
      until: Joi.any().when("state", {
        is: userState.OOO,
        then: Joi.number().required(),
        otherwise: Joi.optional(),
      }),
      message: Joi.when("state", {
        is: userState.IDLE,
        then: Joi.string().required(),
        otherwise: Joi.when(Joi.ref("state"), {
          is: userState.OOO,
          then: Joi.when(Joi.ref("until"), {
            is: Joi.number().greater(
              Joi.ref("from", {
                adjust: (value) => value + threeDaysInMilliseconds,
              })
            ),
            then: Joi.string().optional(),
            otherwise: Joi.required(),
          }),
          otherwise: Joi.optional(),
        }),
      }),
    }),
    monthlyHours: Joi.object().keys({
      committed: Joi.number().required(),
      updatedAt: Joi.number().required(),
    }),
  }).or("currentStatus", "monthlyHours");

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
