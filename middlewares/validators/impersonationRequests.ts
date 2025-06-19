import joi from "joi";
import { NextFunction } from "express";
import { CreateImpersonationRequest, GetImpersonationControllerRequest, ImpersonationRequestResponse } from "../../types/impersonationRequest";
import { REQUEST_STATE } from "../../constants/requests";
const logger = require("../../utils/logger");

/**
 * Middleware to validate query parameters for fetching impersonation requests.
 *
 * @param {GetImpersonationControllerRequest} req - Express request object.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const getImpersonationRequestsValidator = async (
  req: GetImpersonationControllerRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
) => {
  const schema = joi.object().keys({
    dev: joi.bool().sensitive().optional(), // TODO: Remove this validator once feature is tested and ready to be used
    id: joi.string().max(100).pattern(/^[a-zA-Z0-9-_]+$/).optional(),
    createdBy: joi.string().insensitive().optional(),
    createdFor: joi.string().insensitive().optional(),
    status: joi
      .string()
      .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.PENDING, REQUEST_STATE.REJECTED)
      .optional(),
    page: joi.number().integer().min(0).when("next", {
      is: joi.exist(),
      then: joi.forbidden().messages({
        "any.only": "next is not allowed when using page",
      }),
    }).when("prev", {
      is: joi.exist(),
      then: joi.forbidden().messages({
        "any.only": "page is not allowed when using prev",
      }),
    }).optional(),
    next: joi.string().optional(),
    prev: joi.string().optional(),
    size: joi.number().integer().positive().min(1).max(100).optional(),
  });

  try {
    await schema.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error: any) {
    const errorMessages = error.details.map((detail: { message: string }) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    return res.boom.badRequest(errorMessages);
  }
};