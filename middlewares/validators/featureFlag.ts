import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { CustomResponse } from '../../types/global';

const createFeatureFlagSchema = Joi.object({
	Name: Joi.string()
		.required()
		.messages({
			'any.required': 'Name is required'
		}),
	Description: Joi.string()
		.required()
		.messages({
			'any.required': 'Description is required'
		}),
	UserId: Joi.string()
		.required()
		.messages({
			'any.required': 'UserId is required'
		})
});

export const validateCreateFeatureFlag = async (req: Request, res: CustomResponse, next: NextFunction) => {
	try {
		await createFeatureFlagSchema.validateAsync(req.body);
		next();
	} catch (error) {
		logger.error(`Error validating create feature flag payload: ${error.message}`);
		res.boom.badRequest(error.message);
	}
};