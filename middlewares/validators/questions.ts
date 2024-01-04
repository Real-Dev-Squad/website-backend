import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../../types/global";
const logger = require("../../utils/logger");
const joi = require("joi");

const createQuestion = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi.object({
    question: joi.string().required(),
    createdBy: joi.string().required(),
    eventId: joi.string().required(),
    maxCharacters: joi.optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating question: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};

module.exports = { createQuestion };
