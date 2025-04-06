import joi from "joi";
import logger from "../../utils/logger.js";

export const fcmTokenValidator = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    fcmToken: joi.string().required(),
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Bad request body : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
