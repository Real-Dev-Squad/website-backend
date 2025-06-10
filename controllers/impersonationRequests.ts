import {
  ERROR_WHILE_CREATING_REQUEST,
  LOG_ACTION,
  REQUEST_LOG_TYPE,
  REQUEST_STATE,
  TASK_REQUEST_MESSAGES
} from "../constants/requests";
import { createImpersonationRequest } from "../models/impersonationRequests";
import { fetchUser } from "../models/users";
import { addLog } from "../services/logService";
import { User } from "../typeDefinitions/users";
import { NotFound } from "http-errors";
import { CreateImpersonationRequestServiceBody } from "../types/impersonationRequest";
const logger = require("../utils/logger");

/**
 * Service to create a new impersonation request.
 *
 * Checks if the impersonated user exists, creates the request, and logs the action.
 *
 * @param {CreateImpersonationRequestServiceBody} body - The request body containing impersonation details.
 * @returns {Promise<any>} The created impersonation request object.
 * @throws {NotFound} If the impersonated user does not exist.
 * @throws {Error} If there is an error during request creation.
 */
export const createImpersonationRequestService = async (
  body: CreateImpersonationRequestServiceBody
) => {
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
        isImpersonationFinished: impersonationRequest.isImpersonationFinished ? "true" : "false",
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