const Joi = require("joi");
const { userState, CANCEL_OOO } = require("../../constants/userStatus");

const cancelOooSchema = Joi.object()
  .keys({
    cancelOoo: Joi.boolean().valid(true).required(),
  })
  .unknown(false);

const validateUserStatusData = async (todaysTime, req, res, next) => {
  // OOO status can only be set through the proper OOO request approval workflow, not directly via PATCH endpoints
  const validUserStates = [userState.ONBOARDING];

  const statusSchema = Joi.object({
    currentStatus: Joi.object().keys({
      state: Joi.string()
        .trim()
        .valid(...validUserStates)
        .error(new Error(`Invalid State. the acceptable states are ${validUserStates}`)),
      updatedAt: Joi.number().required(),
      from: Joi.number()
        .min(todaysTime)
        .required()
        .error(new Error(`The 'from' field must have a value that is either today or a date that follows today.`)),
      until: Joi.optional(),
      message: Joi.when("state", {
        is: userState.IDLE,
        then: Joi.string()
          .required()
          .error(new Error(`The value for the 'message' field is mandatory for IDLE State.`)),
        otherwise: Joi.optional(),
      }),
    }),
    monthlyHours: Joi.object().keys({
      committed: Joi.number().required(),
      updatedAt: Joi.number().required(),
    }),
  });

  let schema;
  try {
    if (Object.keys(req.body).includes(CANCEL_OOO)) {
      schema = cancelOooSchema;
    } else {
      schema = statusSchema;
    }
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

const validateUserStatusSelf = async (req, res, next) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todaysTime = today.getTime();

  const selfStatusSchema = Joi.object({
    currentStatus: Joi.object().keys({
      state: Joi.forbidden().error(new Error("Updating 'state' is not allowed via this endpoint.")),
      until: Joi.forbidden().error(new Error("Updating 'until' is not allowed via this endpoint.")),
      updatedAt: Joi.number().required(),
      from: Joi.number()
        .min(todaysTime)
        .required()
        .error(new Error(`The 'from' field must have a value that is either today or a date that follows today.`)),
      message: Joi.string().allow("").optional(),
    }),

    monthlyHours: Joi.object().keys({
      committed: Joi.number().required(),
      updatedAt: Joi.number().required(),
    }),
  });

  let schema;
  try {
    if (Object.keys(req.body).includes(CANCEL_OOO)) {
      schema = cancelOooSchema;
    } else {
      schema = selfStatusSchema;
    }
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating UserStatus ${error}`);
    res.boom.badRequest(error);
  }
};

const validateMassUpdate = async (req, res, next) => {
  const schema = Joi.object()
    .keys({
      users: Joi.array()
        .items(
          Joi.object({
            userId: Joi.string().trim().required(),
            state: Joi.string().valid(userState.IDLE, userState.ACTIVE).required(),
          })
        )
        .min(1)
        .required()
        .error(new Error(`Invalid object passed in users.`)),
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
      aggregate: Joi.boolean().valid(true).error(new Error(`Invalid boolean value passed for aggregate.`)),
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
  validateUserStatusSelf,
};
