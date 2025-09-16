import joi from "joi";
import logger from "../../utils/logger.js";

const validateGetMembers = async (req, res, next) => {
  const querySchema = joi.object().keys({
    showArchived: joi.boolean().optional(),
  });

  try {
    await querySchema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error validating getMembers query params : ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export { validateGetMembers };
