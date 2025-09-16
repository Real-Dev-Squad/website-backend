import joi from "joi";
import { Request, NextFunction } from "express";
import { CustomResponse } from "../../typeDefinitions/global.js";
import logger from "../../utils/logger.js";

const createAnswer = async (req: Request, res: CustomResponse, next: NextFunction) => {
  const schema = joi.object({
    answer: joi.string().required(),
    answeredBy: joi.string().required(),
    eventId: joi.string().required(),
    questionId: joi.string().required(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating answer: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

const updateAnswer = async (req: Request, res: CustomResponse, next: NextFunction) => {
  const schema = joi.object({
    status: joi.string().optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating answer: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

export default { createAnswer, updateAnswer };
