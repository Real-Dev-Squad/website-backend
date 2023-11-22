const joi = require("joi");
const logger = require("../../utils/logger.ts");

const createQuestion = async (req, res, next) => {
  const schema = joi.object({
    question: joi.string().required(),
    createdBy: joi.string().required(),
    eventId: joi.string().required(),
    maxWords: joi.optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating question: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = { createQuestion };
