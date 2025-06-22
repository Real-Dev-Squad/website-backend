import {
  ERROR_WHILE_CREATING_REQUEST,
  LOG_ACTION,
  REQUEST_LOG_TYPE,
  REQUEST_STATE,
  TASK_REQUEST_MESSAGES,
  REQUEST_ALREADY_APPROVED,
  REQUEST_ALREADY_REJECTED,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_REJECTED_SUCCESSFULLY,
  UNAUTHORIZED_TO_UPDATE_REQUEST,
} from "../constants/requests";
import { createImpersonationRequest, updateImpersonationRequest, getImpersonationRequestById } from "../models/impersonationRequests";
import { fetchUser } from "../models/users";
import { addLog } from "./logService";
import { User } from "../typeDefinitions/users";
import { NotFound, Forbidden } from "http-errors";
import { CreateImpersonationRequestServiceBody, ImpersonationRequest,   UpdateImpersonationRequestModelDto,
  UpdateImpersonationStatusModelResponse, } from "../types/impersonationRequest";
const logger = require("../utils/logger");

/**
 * Service to create a new impersonation request.
 *
 * Checks if the impersonated user exists, creates the request, and logs the action.
 *
 * @param {CreateImpersonationRequestServiceBody} body - The request body containing impersonation details.
 * @returns {Promise<ImpersonationRequest>} The created impersonation request object.
 * @throws {NotFound} If the impersonated user does not exist.
 * @throws {Error} If there is an error during request creation.
 */
export const createImpersonationRequestService = async (
  body: CreateImpersonationRequestServiceBody
) : Promise<ImpersonationRequest> => {
  try {
    const { userExists, user: impersonatedUser } = await fetchUser({ userId: body.impersonatedUserId });
    if (!userExists) {
      throw new NotFound(TASK_REQUEST_MESSAGES.USER_NOT_FOUND);
    }

    const { username: createdFor } = impersonatedUser as User;

    const impersonationRequest = await createImpersonationRequest({
      status: REQUEST_STATE.PENDING,
      userId: body.userId,
      impersonatedUserId: body.impersonatedUserId,
      isImpersonationFinished: false,
      createdBy: body.createdBy,
      createdFor: createdFor,
      reason: body.reason,
    });

    const impersonationRequestLog = {
      type: REQUEST_LOG_TYPE.REQUEST_CREATED,
      meta: {
        requestId: impersonationRequest.id,
        action: LOG_ACTION.CREATE,
        userId: body.userId,
        createdAt: Date.now(),
      },
      body: {
        ...impersonationRequest,
        isImpersonationFinished: String(impersonationRequest.isImpersonationFinished),
      },
    };

    await addLog(
      impersonationRequestLog.type,
      impersonationRequestLog.meta,
      impersonationRequestLog.body
    );

    return impersonationRequest;
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
};

/**
 * Validates whether an impersonation request can be updated by the given user.
 * @async
 * @function validateUpdateImpersonationRequestService
 * @param {string} requestId - The ID of the impersonation request to validate.
 * @param {string} lastModifiedBy - The user ID attempting the update.
 * @throws {NotFound} If the request does not exist.
 * @throws {Forbidden} If the request is already approved, rejected, or the user is unauthorized.
 * @throws {Error} For any other error during validation.
 */
export const validateUpdateImpersonationRequestService = async (
  requestId: string,
  lastModifiedBy: string
) => {
  try {
    const request = await getImpersonationRequestById(requestId);
    if (!request) {
      throw new NotFound(REQUEST_DOES_NOT_EXIST);
    }

    if (request.status === REQUEST_STATE.APPROVED) {
      throw new Forbidden(REQUEST_ALREADY_APPROVED);
    }

    if (request.status === REQUEST_STATE.REJECTED) {
      throw new Forbidden(REQUEST_ALREADY_REJECTED);
    }

    if (request.impersonatedUserId !== lastModifiedBy) {
      throw new Forbidden(UNAUTHORIZED_TO_UPDATE_REQUEST);
    }
  } catch (error) {
    logger.error("Error while validating update request", error);
    throw error;
  }
};

/**
 * Updates an impersonation request and logs the update action.
 * @async
 * @function updateImpersonationRequestServie
 * @param {UpdateImpersonationRequestModelDto} body - The update data for the impersonation request.
 * @returns {Promise<{ returnMessage: string, updatedRequest: UpdateImpersonationStatusModelResponse }>} The update result and message.
 * @throws {Error} If the update or logging fails.
 */
export const updateImpersonationRequestServie = async (
  body: UpdateImpersonationRequestModelDto
) => {
  try {
    const updatedRequest = await updateImpersonationRequest(body) as UpdateImpersonationStatusModelResponse;

    const [logType, returnMessage] = updatedRequest.status === REQUEST_STATE.APPROVED
      ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
      : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];

    const requestLog = {
      type: logType,
      meta: {
        requestId: body.id,
        action: LOG_ACTION.UPDATE,
        createdBy: body.lastModifiedBy,
      },
      body: updatedRequest,
    };

    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    const response = {
      returnMessage,
      updatedRequest,
    };

    return response;
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
}