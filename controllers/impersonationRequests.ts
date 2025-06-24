import {
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_FETCHING_REQUEST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY
} from "../constants/requests";
import { createImpersonationRequestService } from "../services/impersonationRequests";
import { getImpersonationRequestById, getImpersonationRequests } from "../models/impersonationRequests";
import {
  CreateImpersonationRequest,
  CreateImpersonationRequestBody,
  ImpersonationRequestResponse,
  GetImpersonationControllerRequest
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
 * Controller to fetch impersonation requests.
 *
 * @async
 * @function getImpersonationRequestsController
 * @param {GetImpersonationControllerRequest} req - Express request object containing query parameters.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @returns {Promise<ImpersonationRequestResponse>} Returns one of the following responses.
 */
export const getImpersonationRequestsController = async (
  req: GetImpersonationControllerRequest,
  res: ImpersonationRequestResponse
): Promise<ImpersonationRequestResponse> => {
  try {
    const { query } = req;

    if (query.id) {
      const request = await getImpersonationRequestById(query.id);
      if (!request) {
        return res.status(204).send();
      }
      return res.status(200).json({
        message: REQUEST_FETCHED_SUCCESSFULLY,
        data: request,
      });
    }

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
