import {
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_CREATED_SUCCESSFULLY
} from "../constants/requests";
import { createImpersonationRequestService, updateImpersonationRequestServie, validateUpdateImpersonationRequestService, } from "../services/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  UpdateImpersonationRequest,
  UpdateImpersonationRequestStatusBody,
  ImpersonationRequestResponse
} from "../types/impersonationRequest";
import { NextFunction } from "express";
const logger = require("../utils/logger");

/**
 * Controller to handle creation of an impersonation request.
 *
 * @param {CreateImpersonationRequest} req - Express request object with user and body data.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<ImpersonationRequestResponse | void>}
 */
export const createImpersonationRequestController = async (
  req: CreateImpersonationRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<ImpersonationRequestResponse | void> => {
  try {
    const { impersonatedUserId, reason } = req.body as CreateImpersonationRequestBody;
    const userId = req.userData?.id;
    const createdBy = req.userData?.username;

    const impersonationRequest = await createImpersonationRequestService({
      userId,
      createdBy,
      impersonatedUserId,
      reason
    });

    return res.status(201).json({
      message: REQUEST_CREATED_SUCCESSFULLY,
      data: {
        ...impersonationRequest
      }
    });
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    next(error);
  }
};

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
