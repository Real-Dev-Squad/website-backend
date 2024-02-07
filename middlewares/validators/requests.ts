import { NextFunction } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../../constants/request";
import { OooRequestCreateRequest, OooRequestResponse, OooRequestUpdateRequest } from "../../types/oooRequest";
import { createOooStatusRequestValidator, updateOooStatusRequestValidator } from "./oooRequests";
import joi from "joi";

export const createRequestsMiddleware = async (
  req: OooRequestCreateRequest,
  res: OooRequestResponse,
  next: NextFunction
) => {
  const type = req.body.type;
  // TODO: Remove this check once feature is tested and ready to be used
  if ( req.query.dev !== "true") {
    return res.boom.badRequest("Please use feature flag to make this requests");
  }

  try {
    switch (type) {
      case REQUEST_TYPE.OOO:
        await createOooStatusRequestValidator(req as OooRequestCreateRequest, res as OooRequestResponse, next);
        break;
      default:
        res.boom.badRequest(`Invalid request type: ${type}`);
    }

    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

export const updateRequestsMiddleware = async (
  req: OooRequestUpdateRequest,
  res: OooRequestResponse,
  next: NextFunction
) => {
  const type = req.body.type;

  // TODO: Remove this check once feature is tested and ready to be used
  if ( req.query.dev !== "true") {
    return res.boom.badRequest("Please use feature flag to make this requests");
  }


  try {
    switch (type) {
      case REQUEST_TYPE.OOO:
        await updateOooStatusRequestValidator(req as OooRequestUpdateRequest);
        break;
      default:
        res.boom.badRequest(`Invalid request type: ${type}`);
    }

    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating request payload : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};

export const getRequestsMiddleware = async (req: OooRequestCreateRequest, res: OooRequestResponse, next: NextFunction) => {
  const schema = joi.object().keys({
    dev: joi.bool().sensitive(),
    id: joi.string().optional(),
    type: joi
      .string()
      .valid(REQUEST_TYPE.OOO,"ALL")
      .optional(),
    requestedBy: joi.string().insensitive().optional(),
    state: joi
      .string()
      .valid(REQUEST_STATE.APPROVED, REQUEST_STATE.PENDING, REQUEST_STATE.REJECTED)
      .optional(),
    page: joi.number().integer().min(0),
    next: joi
      .string()
      .optional(),
    prev: joi
      .string()
      .optional(),
    size: joi.number().integer().positive().min(1).max(100).optional(),
  });

  try {
    await schema.validateAsync(req.query);
    next();
  } catch (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    logger.error(`Error while validating request query : ${errorMessages}`);
    res.boom.badRequest(errorMessages);
  }
};
