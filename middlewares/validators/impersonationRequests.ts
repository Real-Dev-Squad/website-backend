import joi from "joi";
import { NextFunction } from "express";
import { CreateImpersonationRequest, ImpersonationRequestResponse, UpdateImpersonationRequest } from "../../types/impersonationRequest";
import { REQUEST_STATE } from "../../constants/requests";
const logger = require("../../utils/logger");

/**
 * Validates the create Impersonation Request payload
 * @param {CreateImpersonationRequest} req - request object.
 * @param {ImpersonationRequestResponse} res - response object.
 * @param {NextFunction} next - next middleware function.
 * @returns {Promise<void>} Resolves or sends errors.
 */
export const createImpersonationRequestValidator = async (
  req: CreateImpersonationRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<void> => {
  const schema = joi.object().strict().keys({
    impersonatedUserId: joi.string().required().messages({
      "string.empty": "impersonatedUserId cannot be empty",
      "any.required": "impersonatedUserId is required"
    }),
    reason: joi.string().required().messages({
      "string.empty": "reason cannot be empty",
      "any.required": "reason is required"
    })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch ( error ) {
    const errorMessages = error.details.map((detail:{message: string}) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    return res.boom.badRequest(errorMessages);
  }
};


export const updateImpersonationRequestValidator=async (
    req:UpdateImpersonationRequest,
    res:ImpersonationRequestResponse,
    next:NextFunction
)=>{
  const schema = joi
    .object()
    .strict()
    .keys({
      status: joi
        .string()
        .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.REJECTED)
        .required()
        .messages({
          "any.only": "status must be APPROVED or REJECTED",
        }),
      message: joi.string().optional()
    });
  
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      const errorMessages = error.details.map((detail:any) => detail.message);
      logger.error(`Error while validating request payload : ${errorMessages}`);
      res.boom.badRequest(errorMessages);
    }
}
