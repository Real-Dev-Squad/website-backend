import joi from "joi";
import { NextFunction } from "express";
import { InviteBodyRequest } from "../../types/invites.js";
import {CustomResponse} from "../../types/global.js";
import logger from "../../utils/logger.js";

export const createInviteValidator = async (req: InviteBodyRequest, res: CustomResponse, next: NextFunction) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      userId: joi.string().required().messages({
        "any.required": "userId is required",
        "string.empty": "userId cannot be empty",
      }),
      purpose: joi.string().required().messages({
        "any.required": "purpose is required",
        "string.empty": "purpose cannot be empty",
      }),
    });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating invite creation payload: ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

