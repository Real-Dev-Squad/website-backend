import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { CustomResponse } from '../../types/global';

const updateFeatureFlagSchema = Joi.object({
  Status: Joi.string()
    .valid('ENABLED', 'DISABLED')
    .required()
    .messages({
      'string.valid': 'Allowed values of Status are ENABLED, DISABLED',
      'any.required': 'Status is required'
    }),
  UserId: Joi.string()
    .required()
    .messages({
      'any.required': 'UserId is required'
    })
});

export const validateUpdateFeatureFlag = async (req: Request, res: CustomResponse, next: NextFunction) => {
  try {
    await updateFeatureFlagSchema.validateAsync(req.body);
    next();
  } catch (error) {
    logger.error(`Error validating update feature flag payload: ${error.message}`);
    res.boom.badRequest(error.message);
  }
}; 