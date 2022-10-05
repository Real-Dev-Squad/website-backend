const joi = require("joi");

const validateJoinData = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required(),
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
  validateJoinData,
};
