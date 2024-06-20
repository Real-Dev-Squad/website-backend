const { customWordCountValidator } = require("../../utils/customWordCountValidator");

const joi = require("joi");
const {
  USER_STATUS,
  USERS_PATCH_HANDLER_ACTIONS,
  USERS_PATCH_HANDLER_ERROR_MESSAGES,
} = require("../../constants/users");
const ROLES = require("../../constants/roles");
const { IMAGE_VERIFICATION_TYPES } = require("../../constants/imageVerificationTypes");
const { userState } = require("../../constants/userStatus");

const updateUser = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      phone: joi.string().optional(),
      email: joi.string().optional(),
      username: joi
        .string()
        .optional()
        .min(4)
        .max(20)
        .regex(/^[a-zA-Z0-9-]+$/)
        .message("Username must be between 4 and 20 characters long and contain only letters or numbers."),
      first_name: joi.string().optional(),
      last_name: joi.string().optional(),
      yoe: joi.number().min(0).optional(),
      company: joi.string().optional(),
      designation: joi.string().optional(),
      img: joi.string().optional(),
      linkedin_id: joi
        .string()
        .optional()
        .regex(/^[^@\s]*$/)
        .message("Invalid Linkedin ID. ID should not contain special character @ or spaces"),
      twitter_id: joi
        .string()
        .optional()
        .regex(/^[^@\s]*$/)
        .message("Invalid Twitter ID. ID should not contain special character @ or spaces"),
      instagram_id: joi
        .string()
        .optional()
        .regex(/^[^@\s]*$/)
        .message("Invalid Instagram ID. ID should not contain special character @ or spaces"),
      website: joi.string().optional(),
      status: joi
        .any()
        .valid(...Object.values(USER_STATUS))
        .optional(),
      discordId: joi.string().optional(),
      roles: joi.object().keys({
        designer: joi.boolean().optional(),
        maven: joi.boolean().optional(),
        product_manager: joi.boolean().optional(),
      }),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateUser payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateProfileURL = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    profileURL: joi.string().uri().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateProfileURL payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateJoinData = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().optional(),
      firstName: joi.string().min(1).required(),
      lastName: joi.string().min(1).required(),
      college: joi.string().min(1).required(),
      skills: joi.string().min(5).required(),
      city: joi.string().min(1).required(),
      state: joi.string().min(1).required(),
      country: joi.string().min(1).required(),
      foundFrom: joi.string().min(1).required(),
      introduction: joi.string().min(1).required(),
      forFun: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      funFact: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      whyRds: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      flowState: joi.string().optional(),
      numberOfHours: joi.number().min(1).max(100).required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating recruiter data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

/**
 * Validates getting users query
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Object} - Express middelware function
 */
async function getUsers(req, res, next) {
  const schema = joi

    .object()
    .strict()
    .keys({
      size: joi
        .string()
        .optional()
        .pattern(/^[1-9]\d?$|^100$/)
        .messages({
          "string.empty": "size must contain value in range 1-100",
          "string.pattern.base": "size must be in range 1-100",
        }),
      page: joi
        .string()
        .optional()
        .pattern(/^0$|^[1-9]\d*$/)
        .messages({
          "string.empty": "page must contain a positive number or zero",
          "string.pattern.base": "page value either be a positive number or zero",
        }),
      search: joi.string().optional().messages({
        "string.empty": "search value must not be empty",
      }),
      id: joi.string().optional().messages({
        "string.empty": "id value must not be empty",
      }),
      discordId: joi.string().optional().messages({
        "string.empty": "discord id value must not be empty",
      }),
      next: joi
        .string()
        .optional()
        .when("page", {
          is: joi.exist(),
          then: joi.custom((_, helpers) => helpers.message("Both page and next can't be passed")),
        })
        .messages({
          "string.empty": "next value cannot be empty",
        }),
      prev: joi
        .string()
        .optional()
        .when("next", {
          is: joi.exist(),
          then: joi.custom((_, helpers) => helpers.message("Both prev and next can't be passed")),
        })
        .concat(
          joi.string().when("page", {
            is: joi.exist(),
            then: joi.custom((_, helpers) => helpers.message("Both page and prev can't be passed")),
          })
        )
        .messages({
          "string.empty": "prev value cannot be empty",
        }),
      query: joi.string().optional(),
      q: joi.string().optional(),
      filterBy: joi.string().optional(),
      days: joi.string().optional(),
      dev: joi.string().optional(),
    });
  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error in getting users: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
}

/**
 * Validator function for query params for the filter route
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Object} - Express middleware function
 */

async function validateUserQueryParams(req, res, next) {
  const validUserStates = [userState.OOO, userState.ONBOARDING, userState.IDLE, userState.ACTIVE];
  const schema = joi
    .object({
      levelId: joi.array().items(joi.string()).single().optional(),
      levelName: joi.array().items(joi.string()).single().optional(),
      levelValue: joi.array().items(joi.number()).single().optional(),
      tagId: joi.array().items(joi.string()).single().optional(),
      state: joi
        .alternatives(joi.string().valid(...validUserStates), joi.array().items(joi.string().valid(...validUserStates)))
        .optional(),
      role: joi.string().valid(ROLES.MEMBER, ROLES.INDISCORD, ROLES.ARCHIVED).optional(),
      verified: joi.string().optional(),
      time: joi
        .string()
        .regex(/^[1-9]\d*d$/)
        .optional(),
      page: joi.number().integer().min(0).message("Page must be a non-negative integer").optional(),
      size: joi.number().integer().min(1).max(100).message("size must be a number between 1 and 100").optional(),
      prev: joi.string().allow("").optional(),
      next: joi.string().allow("").optional(),
      dev: joi.bool().optional().sensitive(),
    })
    .min(1)
    .messages({ "object.min": "Please provide at least one filter criteria" });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating query parameters: ${error}`);
    res.boom.badRequest(error.details.map((err) => err.message).join(", "));
  }
}

/**
 * Validator function for query params for the filter route
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Object} - Express middleware function
 */
const validateImageVerificationQuery = async (req, res, next) => {
  const { type: imageType } = req.query;
  try {
    if (!IMAGE_VERIFICATION_TYPES.includes(imageType)) {
      throw new Error("Invalid verification type was provided!");
    }
    next();
  } catch (error) {
    logger.error(`Error validating createLevel payload : ${error}`);
    res.boom.badRequest(error.message);
  }
};

async function validateUpdateRoles(req, res, next) {
  const schema = joi.object().strict().min(1).max(2).keys({
    // either member or archived with reason (optional) is allowed
    member: joi.boolean(),
    archived: joi.boolean(),
    reason: joi.string().optional(), // reason is optional
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateRoles query params : ${error}`);
    res.boom.badRequest("we only allow either role member or archived with a reason");
  }
}

async function validateUsersPatchHandler(req, res, next) {
  const requestBodySchema = joi.object({
    action: joi
      .string()
      .valid(USERS_PATCH_HANDLER_ACTIONS.ARCHIVE_USERS, USERS_PATCH_HANDLER_ACTIONS.NON_VERFIED_DISCORD_USERS)
      .required(),
  });

  try {
    await requestBodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error("Error in validating action payload", error);
    res.boom.badRequest(`${USERS_PATCH_HANDLER_ERROR_MESSAGES.VALIDATE_PAYLOAD}: ${error.message}`);
  }
}

/**
 * Validates query params for the username route
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Object} - Express middelware function
 */
const validateGenerateUsernameQuery = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      firstname: joi.string().min(1).required(),
      lastname: joi.string().min(1).required(),
      dev: joi.string().valid("true").optional(),
    });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error("Invalid Query Parameters Passed");
    res.boom.badRequest("Invalid Query Parameters Passed");
  }
};
const migrationsValidator = async (req, res, next) => {
  const { action, page, size } = req.query;
  const schema = joi
    .object()
    .strict()
    .keys({
      page: joi.number(),
      action: joi.string().valid("adds-github-id").required(),
      size: joi.number().min(1).max(500).required(),
    });
  try {
    await schema.validateAsync({ action, page: parseInt(page), size: parseInt(size) });
    next();
  } catch (error) {
    logger.error("Invalid Query Parameters Passed", error);
    res.boom.badRequest("Invalid Query Parameters Passed");
  }
};
module.exports = {
  updateUser,
  updateProfileURL,
  validateJoinData,
  getUsers,
  validateUserQueryParams,
  validateImageVerificationQuery,
  validateUpdateRoles,
  validateUsersPatchHandler,
  validateGenerateUsernameQuery,
  migrationsValidator,
};
