import {
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_FETCHING_REQUEST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_CREATED_SUCCESSFULLY,
  OPERATION_NOT_ALLOWED
} from "../constants/requests.js";
import { createImpersonationRequestService, updateImpersonationRequestService, generateImpersonationTokenService, startImpersonationService, stopImpersonationService } from "../services/impersonationRequests.js";
import { getImpersonationRequestById, getImpersonationRequests } from "../models/impersonationRequests.js";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  UpdateImpersonationRequest,
  UpdateImpersonationRequestStatusBody,
  ImpersonationRequestResponse,
  GetImpersonationControllerRequest,
  GetImpersonationRequestByIdRequest,
  ImpersonationSessionRequest
} from "../types/impersonationRequest.js";
import { getPaginatedLink } from "../utils/helper.js";
import { NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * Controller to handle creation of an impersonation request.
 *
 * @param {CreateImpersonationRequest} req - Express request object with user and body data.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<ImpersonationRequestResponse | void>} Returns the created request or passes error to next middleware.
 */
export const createImpersonationRequestController = async (
  req: CreateImpersonationRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
): Promise<ImpersonationRequestResponse | void> => {
  try {
    const { createdFor, reason } = req.body as CreateImpersonationRequestBody;
    const userId = req.userData?.id;

    const impersonationRequest = await createImpersonationRequestService({
      createdBy: userId,
      createdFor,
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
 * Controller to fetch an impersonation request by its ID.
 *
 * @param {GetImpersonationRequestByIdRequest} req - Express request object containing `id` parameter.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @returns {Promise<ImpersonationRequestResponse>} Returns the request if found, or 404 if it doesn't exist.
 */
export const getImpersonationRequestByIdController = async (
  req: GetImpersonationRequestByIdRequest,
  res: ImpersonationRequestResponse
): Promise<ImpersonationRequestResponse> => {
  const id = req.params.id;
  try {
    const request = await getImpersonationRequestById(id);

    if (!request) {
      return res.status(404).json({
        message: REQUEST_DOES_NOT_EXIST,
      });
    }

    return res.status(200).json({
      message: REQUEST_FETCHED_SUCCESSFULLY,
      data: request,
    });

  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};

/**
 * Controller to fetch impersonation requests with optional filtering and pagination.
 *
 * @param {GetImpersonationControllerRequest} req - Express request object containing query parameters.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @returns {Promise<ImpersonationRequestResponse>} Returns paginated impersonation request data or 204 if none found.
 */
export const getImpersonationRequestsController = async (
  req: GetImpersonationControllerRequest,
  res: ImpersonationRequestResponse
): Promise<ImpersonationRequestResponse> => {
  try {
    const { query } = req;

    const requests = await getImpersonationRequests(query);
    if (!requests || requests.allRequests.length === 0) {
      return res.status(204).send();
    }

    const { allRequests, next, prev } = requests;
    const count = allRequests.length;

    let nextUrl = null;
    let prevUrl = null;
    if (next) {
      nextUrl = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "next",
        docId: next,
      });
    }
    if (prev) {
      prevUrl = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "prev",
        docId: prev,
      });
    }

    return res.status(200).json({
      message: REQUEST_FETCHED_SUCCESSFULLY,
      data: allRequests,
      next: nextUrl,
      prev: prevUrl,
      count,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
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
    const requestBody: UpdateImpersonationRequestStatusBody = req.body;
    
    const { returnMessage, updatedRequest: response } = await updateImpersonationRequestService({
      id: requestId,
      updatePayload: requestBody,
      lastModifiedBy,
    });

    return res.status(200).json({
      message: returnMessage,
      data: {
        ...response,
      },
    });
  } catch (error) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
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
): Promise<ImpersonationRequestResponse | void> => {
  const { action } = req.query;
  const requestId = req.params.id;
  const userId = req.userData?.id;
  let authCookie;
  let response;
  try {

    if (action === "START") {
      authCookie = await generateImpersonationTokenService(requestId, action);
      response = await startImpersonationService({ requestId, userId });
    }

    if (action === "STOP") {
      authCookie = await generateImpersonationTokenService(requestId, action);
      response = await stopImpersonationService({ requestId, userId });
    }

    res.clearCookie(authCookie.name);
    res.cookie(authCookie.name, authCookie.value, authCookie.options);

    return res.status(200).json({
      message: response.returnMessage,
      data: response.updatedRequest
    });
  } catch (error) {
    logger.error(`Failed to process impersonation ${action} for requestId=${requestId}, userId=${userId}`, error);
    return next(error);
  }
};
