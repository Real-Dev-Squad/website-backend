import { NextFunction, Request } from "express";
import joi from "joi";
import { CustomResponse } from "../../types/global";
import { REQUEST_TYPE } from "../../constants/requests";

export const updateOnboardingExtensionRequestValidator = async (req: Request, res: CustomResponse, next: NextFunction) => {
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

export const updateRequestValidator = async (
    req: Request,
    res: CustomResponse,
    next: NextFunction
    ) => {
    const type = req.body.type;
    switch (type) {
        case REQUEST_TYPE.ONBOARDING:
            await updateOnboardingExtensionRequestValidator(req, res, next);
            break;
        default:
            return res.boom.badRequest("Invalid type");
    }
};