import { NextFunction } from "express";
import { REQUEST_TYPE } from "../../constants/request";
import { OooRequestCreateRequest, OooStatusRequestResponse } from "../../types/oooRequest";
import { createOooStatusRequestValidator } from "./oooRequests";

export const createRequestsMiddleware = async (
  req: OooRequestCreateRequest,
  res: OooStatusRequestResponse,
  next: NextFunction
) => {
  const type = req.body.type;

  try {
    switch (type) {
      case REQUEST_TYPE.OOO:
        await createOooStatusRequestValidator(req as OooRequestCreateRequest, res as OooStatusRequestResponse, next);
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
