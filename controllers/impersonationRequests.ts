import {
  ERROR_WHILE_CREATING_REQUEST,
  FEATURE_NOT_IMPLEMENTED,
  REQUEST_CREATED_SUCCESSFULLY
} from "../constants/requests";
import { createImpersonationRequestService, generateImpersonationTokenService, startImpersonationService, stopImpersonationService } from "../services/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
  ImpersonationSessionRequest
} from "../types/impersonationRequest";
import { Forbidden } from "http-errors";
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
 * Controller to handle impersonation session actions (START or STOP).
 *
 * @param {ImpersonationSessionRequest} req - Express request object containing user data, query params, and impersonation flag.
 * @param {ImpersonationRequestResponse} res - Express response object used to send the response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @returns {Promise<ImpersonationRequestResponse>} Sends a JSON response with updated request data and sets authentication cookies based on action.
 *
 * @throws {Forbidden} If the action is invalid or STOP is requested without an active impersonation session.
 */
export const impersonationController = async (
  req: ImpersonationSessionRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<ImpersonationRequestResponse> => {
  const { action } = req.query;
  const requestId = req.params.id;
  const userId = req.userData?.id;

  let body;
  let response;

  try {
    if (action === "START") {
      response = await startImpersonationService({ requestId, userId });
      body = await generateImpersonationTokenService(requestId, action);
    } else if (action === "STOP" && req?.isImpersonating) {
      response = await stopImpersonationService({ requestId, userId });
      body = await generateImpersonationTokenService(requestId, action);
    } else {
      throw new Forbidden("Invalid impersonation session");
    }

    res.clearCookie(body.name);
    res.cookie(body.name, body.value, body.options);

    return res.status(200).json({
      message: response?.returnMessage,
      data: response.updatedRequest
    });
  } catch (error) {
    logger.error("Error while handling impersonation request", error);
    next(error);
  }
};
