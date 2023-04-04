const joi = require("joi");
const { USER_STATUS } = require("../../constants/users");

const updateUser = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      phone: joi.string().optional(),
      email: joi.string().optional(),
      username: joi.string().optional(),
      first_name: joi.string().optional(),
      last_name: joi.string().optional(),
      yoe: joi.number().min(0).optional(),
      company: joi.string().optional(),
      designation: joi.string().optional(),
      img: joi.string().optional(),
      linkedin_id: joi.string().optional(),
      twitter_id: joi.string().optional(),
      instagram_id: joi.string().optional(),
      website: joi.string().optional(),
      status: joi
        .any()
        .valid(...Object.values(USER_STATUS))
        .optional(),
      discordId: joi.string().optional(),
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
      forFun: joi.string().min(100).required(),
      funFact: joi.string().min(100).required(),
      whyRds: joi.string().min(100).required(),
      flowState: joi.string().optional(),
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
  const schema = joi
    .object()
    .strict()
    .min(1)
    .keys({
      levelId: joi.array().items(joi.string()).single().optional(),
      levelName: joi.array().items(joi.string()).single().optional(),
      levelValue: joi.array().items(joi.number()).single().optional(),
      tagId: joi.array().items(joi.string()).single().optional(),
      state: joi
        .alternatives()
        .try(
          joi.string().valid("IDLE", "OOO", "ACTIVE"),
          joi.array().items(joi.string().valid("IDLE", "OOO", "ACTIVE"))
        )
        .optional(),
    });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating query params : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
}

module.exports = {
  updateUser,
  updateProfileURL,
  validateJoinData,
  getUsers,
  validateUserQueryParams,
};
