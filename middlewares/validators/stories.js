const joi = require("joi");
const { storyStatusEnum } = require("../../constants/stories");

const createStory = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required(),
      description: joi.string().optional(),
      status: joi
        .any()
        .valid(...storyStatusEnum)
        .required(),
      tasks: joi.array().items(joi.string()).optional(),
      featureOwner: joi.string().optional(),
      backendEngineer: joi.string().optional(),
      frontendEngineer: joi.string().optional(),
      startedOn: joi.number().optional(),
      endsOn: joi.number().optional(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createStory payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateStory = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().optional(),
      description: joi.string().optional(),
      status: joi
        .any()
        .valid(...storyStatusEnum)
        .optional(),
      tasks: joi.array().items(joi.string()).optional(),
      featureOwner: joi.string().optional(),
      backendEngineer: joi.string().optional(),
      frontendEngineer: joi.string().optional(),
      startedOn: joi.number().optional(),
      endsOn: joi.number().optional(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating updateStory payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createStory,
  updateStory,
};
