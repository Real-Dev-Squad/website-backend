const joi = require("joi");
import { Request, NextFunction } from "express";
import { CustomResponse } from "../../typeDefinitions/global";

const createAnswer = async (req : Request, res: CustomResponse, next: NextFunction) => {
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

module.exports = { createAnswer };
