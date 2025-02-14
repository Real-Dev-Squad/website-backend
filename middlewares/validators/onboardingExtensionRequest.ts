import joi from "joi";
import { NextFunction } from "express";
import { REQUEST_TYPE } from "../../constants/requests";
import { OnboardingExtensionCreateRequest, OnboardingExtensionResponse, UpdateOnboardingExtensionRequest } from "../../types/onboardingExtension";
import { logger } from "../../utils/logger";

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

/**
 * Validates onboarding extension request payload.
 * 
 * @param {UpdateOnboardingExtensionRequest} req - Request object.
 * @param {OnboardingExtensionResponse} res - Response object.
 * @param {NextFunction} next - Next middleware if valid.
 * @returns {Promise<void>} Resolves or sends errors.
 */
export const updateOnboardingExtensionRequestValidator = async (
  req: UpdateOnboardingExtensionRequest, 
  res: OnboardingExtensionResponse, 
  next: NextFunction): Promise<void> => {
  const schema = joi
  .object()
  .strict()
  .keys({
      reason: joi.string().optional(),
      newEndsOn: joi.number().positive().min(Date.now()).required().messages({
          'number.any': 'newEndsOn is required',
          'number.base': 'newEndsOn must be a number',
          'number.positive': 'newEndsOn must be positive',
          'number.greater': 'newEndsOn must be greater than current date',
      }),
      type: joi.string().equal(REQUEST_TYPE.ONBOARDING).required().messages({
          "type.any": "type is required",
      })
  });

  try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
  } catch (error) {
      const errorMessages = error.details.map((detail:{message: string}) => detail.message);
      logger.error(`Error while validating request payload : ${errorMessages}`);
      return res.boom.badRequest(errorMessages);
  }
}
