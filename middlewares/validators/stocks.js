import joi from "joi";
import logger from "../../utils/logger.js";

const createStock = async (req, res, next) => {
  const schema = joi.object().strict().keys({
    name: joi.string().required(),
    quantity: joi.number().required(),
    price: joi.number().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating createStock payload : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export default {
  createStock,
};
