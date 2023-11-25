import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
import { customWordCountValidator } from "../../utils/customWordCountValidator";
const joi = require("joi");

const validateApplicationData = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().optional(),
      firstName: joi.string().min(1).required(),
      lastName: joi.string().min(1).required(),
      college: joi.string().min(1).required(),
      skills: joi.string().min(5).required(),
      city: joi.string().min(1).required(),
      state: joi.string().min(1).required(),
      country: joi.string().min(1).required(),
      foundFrom: joi.string().min(1).required(),
      introduction: joi.string().min(1).required(),
      forFun: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      funFact: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      whyRds: joi
        .string()
        .custom((value, helpers) => customWordCountValidator(value, helpers, 100))
        .required(),
      flowState: joi.string().optional(),
      numberOfHours: joi.number().min(1).max(100).required(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating recruiter data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const validateApplicationUpdateData = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      status: joi.string().min(1).optional(),
      feedback: joi.string().min(1).optional(),
    });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error in validating recruiter data: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = {
  validateApplicationData,
  validateApplicationUpdateData,
};
