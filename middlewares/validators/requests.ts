import { NextFunction } from "express";
import { REQUEST_TYPE } from "../../constants/request";
import { OooRequestCreateRequest, OooRequestResponse } from "../../types/oooRequest";
import { createOooStatusRequestValidator } from "./oooRequests";

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
