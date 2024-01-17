import joi from "joi";
import { NextFunction, Request } from "express";
import { InviteBodyRequest, InviteResponse } from "../../types/invite";

export const createInviteValidator = async (req: InviteBodyRequest, res: InviteResponse, next: NextFunction) => {
  const schema = joi
    .object()
    .strict()
    .keys({
      uniqueUserId: joi.string().required().messages({
        "any.required": "uniqueUserId is required",
        "string.empty": "uniqueUserId cannot be empty",
      }),
      reason: joi.string().required().messages({
        "any.required": "reason is required",
        "string.empty": "reason cannot be empty",
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

export const getInviteValidator = async (req: Request, res: InviteResponse, next: NextFunction) => {
  const queryParamsSchema = joi.object().keys({
    uniqueUserId: joi.string().required().messages({
      "any.required": "uniqueUserId is required",
      "string.empty": "uniqueUserId cannot be empty",
    }),
  });

  try {
    await queryParamsSchema.validateAsync(req.query);
    next();
  } catch (error) {
    logger.error(`Error while validating invite get query params: ${error}`);
    res.boom.badRequest(error.details[0].message);
  }
};
