const joi = require("joi");

export const notifyValidator = async (req, res, next) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required(),
      body: joi.string().required(),
      userId: joi.string(),
      groupRoleId: joi.string(),
    })
    .xor("userId", "groupRoleId");
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Bad request body : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
