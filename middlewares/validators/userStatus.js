const Joi = require("joi");
const { userState } = require("../../constants/userStatus");
const threeDaysInMilliseconds = 172800000;

const validateUserStatusData = async (todaysTime, req, res, next) => {
  const schema = Joi.object({
    currentStatus: Joi.object().keys({
      state: Joi.string()
        .trim()
        .valid(userState.IDLE, userState.ACTIVE, userState.OOO, userState.ONBOARDING)
        .error(new Error(`Invalid State. State must be either IDLE, ACTIVE, OOO, or ONBOARDING`)),
      updatedAt: Joi.number().required(),
      from: Joi.number()
        .min(todaysTime)
        .required()
        .error(new Error(`The 'from' field must have a value that is either today or a date that follows today.`)),
      until: Joi.any().when("state", {
        is: userState.OOO,
        then: Joi.number()
          .min(Joi.ref("from"))
          .required()
          .error(
            new Error(
              `The 'until' field must have a value that is either 'from' date or a date that comes after 'from' day.`
            )
          ),
        otherwise: Joi.optional(),
      }),
      message: Joi.when("state", {
        is: userState.IDLE,
        then: Joi.string()
          .required()
          .error(new Error(`The value for the 'message' field is mandatory for IDLE State.`)),
        otherwise: Joi.when(Joi.ref("state"), {
          is: userState.OOO,
          then: Joi.when(Joi.ref("until"), {
            is: Joi.number().greater(
              Joi.ref("from", {
                adjust: (value) => value + threeDaysInMilliseconds,
              })
            ),
            then: Joi.string()
              .optional()
              .error(
                new Error(`The value for the 'message' field is mandatory when State is OOO for more than three days.`)
              ),
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
    res.boom.badRequest(error);
  }
};

const validateUserStatus = (req, res, next) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todaysTime = today.getTime();
  validateUserStatusData(todaysTime, req, res, next);
};

const validateMassUpdate = async (req, res, next) => {
  const schema = Joi.object()
    .keys({
      users: Joi.array()
        .items(Joi.string().trim())
        .min(1)
        .required()
        .error(new Error(`Invalid state value passed for users.`)),
    })
    .messages({
      "object.unknown": "Invalid key in Request payload.",
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating Query Params for GET ${error.message}`);
    res.boom.badRequest(error);
  }
};

const validateGetQueryParams = async (req, res, next) => {
  const schema = Joi.object()
    .keys({
      taskStatus: Joi.string()
        .trim()
        .valid(userState.IDLE)
        .error(new Error(`Invalid state value passed for taskStatus.`)),
      state: Joi.string()
        .trim()
        .valid(userState.IDLE, userState.ACTIVE, userState.OOO, userState.ONBOARDING)
        .error(new Error(`Invalid State. State must be either IDLE, ACTIVE, OOO, or ONBOARDING`)),
    })
    .messages({
      "object.unknown": "Invalid query param provided.",
    });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating Query Params for GET ${error.message}`);
    res.boom.badRequest(error);
  }
};

module.exports = {
  validateUserStatus,
  validateMassUpdate,
  validateGetQueryParams,
};
