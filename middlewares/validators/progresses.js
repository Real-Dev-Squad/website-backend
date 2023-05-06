const joi = require("joi");

const validateProgresses = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      type: joi.string().valid("user", "task").required(),
      completed: joi.string().required(),
      planned: joi.string().required(),
      blockers: joi.string().allow("").required(),
    });

  if (req.body.type === "task") {
    schema.keys({ taskId: joi.string().required() });
  }

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createStock payload: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  createStock: validateProgresses,
};
