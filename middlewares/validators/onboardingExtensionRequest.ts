import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_TYPE } from "../../constants/requests";
import { OnboardingExtensionCreateRequest, OnboardingExtensionResponse } from "../../types/onboardingExtension";

export const createOnboardingExtensionRequestValidator = async (
  req: OnboardingExtensionCreateRequest,
  _res: OnboardingExtensionResponse,
  _next: NextFunction
) => {

  const schema = joi
    .object()
    .strict()
    .keys({
      numberOfDays: joi.number().required().positive().integer().min(1).messages({
        "number.base": "numberOfDays must be a number",
        "any.required": "numberOfDays is required",
        "number.positive": "numberOfDays must be positive",
        "number.min": "numberOfDays must be greater than zero",
        "number.integer": "numberOfDays must be a integer"
      }),
      reason: joi.string().required().messages({
        "string.empty": "reason cannot be empty",
        "any.required": "reason is required",
      }),
      type: joi.string().valid(REQUEST_TYPE.ONBOARDING).required().messages({
        "string.empty": "type cannot be empty",
        "any.required": "type is required",
      }),
      userId: joi.string().required().messages({
        "string.empty": "userId cannot be empty",
        "any.required": "userId is required"
      })
    });
  try{
    await schema.validateAsync(req.body, { abortEarly: false });
  }catch(error){
    logger.error(`Error while validating request payload`, error);
    throw error;
  }
};
