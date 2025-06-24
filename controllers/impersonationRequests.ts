import {
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_FETCHING_REQUEST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST
} from "../constants/requests";
import { createImpersonationRequestService } from "../services/impersonationRequests";
import { getImpersonationRequestById, getImpersonationRequests } from "../models/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
  GetImpersonationControllerRequest,
  GetImpersonationRequestByIdRequest
} from "../types/impersonationRequest";
import { getPaginatedLink } from "../utils/helper";
import { NextFunction } from "express";
const logger = require("../utils/logger");

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
