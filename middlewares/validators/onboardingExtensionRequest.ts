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
      numberOfDays: joi.number().required().min(1).messages({
        "number.base": "numberOfDays must be a number",
        "any.required": "numberOfDays is required",
      }),
      reason: joi.string().required().messages({
        "string.empty": "reason cannot be empty",
      }),
      type: joi.string().valid(REQUEST_TYPE.ONBOARDING).required().messages({
        "string.empty": "type cannot be empty",
        "any.required": "type is required",
      }),
      requestedBy: joi.string().required().messages({
        "string.empty": "requestedBy cannot be empty"
      }),
      username: joi.string().required().messages({
        "string.empty": "username cannot be empty"
      })
    });

  await schema.validateAsync(req.body, { abortEarly: false });
};
