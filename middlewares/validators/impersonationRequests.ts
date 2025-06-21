import joi from "joi";
import { NextFunction} from "express";
import { ImpersonationRequestResponse, UpdateImpersonationRequest } from "../../types/impersonationRequest";
import { REQUEST_STATE } from "../../constants/requests";
const logger = require("../../utils/logger");


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
