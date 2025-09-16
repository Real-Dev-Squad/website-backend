import joi from "joi";
import logger from "../../utils/logger.js";

export const notifyValidator = async (req, res, next) => {
  const MAX_TITLE_LENGTH = 512;
  const MAX_BODY_LENGTH = 1536;

  const schema = joi
    .object()
    .strict()
    .keys({
      title: joi.string().required().max(MAX_TITLE_LENGTH).required(),
      body: joi.string().required().max(MAX_BODY_LENGTH).required(),
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
