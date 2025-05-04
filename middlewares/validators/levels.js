import Joi from "joi";
import logger from "../../utils/logger.js";

const validateLevelBody = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    value: Joi.number().integer().min(0).required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createLevel payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export { validateLevelBody };
