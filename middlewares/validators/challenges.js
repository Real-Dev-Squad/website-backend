const joi = require('joi');

const createChallenge = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    title: joi.string().required(),
    level: joi.string().required(),
    start_date: joi.number().required(),
    end_date: joi.number().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createChallenge payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createChallenge,
};
