const joi = require("joi");
const { userStatusEnum } = require("../../constants/users");

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
        .valid(...userStatusEnum)
        .optional(),
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
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      college: joi.string().min(5).required(),
      skills: joi.string().min(5).required(),
      city: joi.string().required(),
      state: joi.string().required(),
      country: joi.string().required(),
      heardAbout: joi.string().required(),
      introduction: joi.string().required(),
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
module.exports = {
  updateUser,
  updateProfileURL,
  validateJoinData,
};
