import {
  ERROR_WHILE_UPDATING_REQUEST,
  FEATURE_NOT_IMPLEMENTED
} from "../constants/requests";
import {
  updateImpersonationRequestServie,
  validateUpdateImpersonationRequestService,
} from "../services/impersonationRequests";
import {
  ImpersonationRequestResponse,
  UpdateImpersonationRequest,
  UpdateImpersonationRequestStatusBody,
} from "../types/impersonationRequest";
const logger = require("../utils/logger");
import { NextFunction } from "express";

/**
 * Controller to  Update the status of an impersonation request.
 *
 * @param {UpdateImpersonationRequest} req - Express request with params, body, and user data.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @param {NextFunction} next - Express middleware `next` function.
 * @returns {Promise<ImpersonationRequestResponse>} Returns updated request data or passes error to `next`.
 */
export const updateImpersonationRequestStatusController = async (
  req: UpdateImpersonationRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<ImpersonationRequestResponse> => {
  try {
    const requestId = req.params.id;
    const lastModifiedBy = req.userData.id;
    const requestBody = req.body as UpdateImpersonationRequestStatusBody;

    await validateUpdateImpersonationRequestService(requestId, lastModifiedBy);
    const { returnMessage, updatedRequest: response } = await updateImpersonationRequestServie({
      id: requestId,
      updatingBody: requestBody,
      lastModifiedBy,
    });

    return res.status(200).json({
      message: returnMessage,
      data: {
        id: response.id,
        ...response,
      },
    });
  } catch (error) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
    next(error);
  }
};
