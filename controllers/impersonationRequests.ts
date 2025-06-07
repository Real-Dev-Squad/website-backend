import {
  ERROR_WHILE_CREATING_REQUEST,
  FEATURE_NOT_IMPLEMENTED,
  REQUEST_CREATED_SUCCESSFULLY
} from "../constants/requests";
import { createImpersonationRequestService } from "../services/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse
} from "../types/impersonationRequest";
const logger = require("../utils/logger");
import { NextFunction } from "express";

/**
 * Controller to handle creation of an impersonation request.
 *
 * @param {CreateImpersonationRequest} req - Express request object, extended with userData.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const createImpersonationRequestController = async (
  req: CreateImpersonationRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<ImpersonationRequestResponse> => {
  const dev = req.query.dev === "true";
  if (!dev) return res.boom.notImplemented(FEATURE_NOT_IMPLEMENTED);

  try {
    const { impersonatedUserId, reason } = req.body as CreateImpersonationRequestBody;
    const userId = req?.userData?.id;
    const createdBy = req?.userData?.username;

    const impersonationRequest = await createImpersonationRequestService({
      userId,
      createdBy,
      impersonatedUserId,
      reason
    });

    return res.status(201).json({
      message: REQUEST_CREATED_SUCCESSFULLY,
      data: {
        id: impersonationRequest.id,
        ...impersonationRequest
      }
    });
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    next(error);
  }
};