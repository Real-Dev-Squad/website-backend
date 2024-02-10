const joi = require("joi");

const createArt = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required(),
      price: joi.number().min(0).required(),
      css: joi.string().required(),
    });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error creating art : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createArt,
};
