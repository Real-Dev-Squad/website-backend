import { ERROR_WHILE_CREATING_REQUEST, IMPERSONATION_NOT_COMPLETED, LOG_ACTION, REQUEST_ALREADY_PENDING, REQUEST_DOES_NOT_EXIST, REQUEST_LOG_TYPE, REQUEST_STATE, TASK_REQUEST_MESSAGES } from "../constants/requests";
import { createImpersonationRequest, getImpersonationRequestByKeyValues } from "../models/impersonationRequests";
import { fetchUser } from "../models/users";
import { addLog } from "./logService";
import { User } from "../typeDefinitions/users";
import { NotFound, Forbidden } from "http-errors";
import { CreateImpersonationRequestServiceBody } from "../types/impersonationRequest";
const logger = require("../utils/logger");

/**
 * Validates and creates a new impersonation request.
 * - Checks if the impersonated user exists.
 * - Checks for existing approved or pending requests.
 * - Creates a new impersonation request if validation passes.
 * - Logs the creation event.
 *
 * @param {string} userId - The ID of the user making the request.
 * @param {string} createdBy - The ID of the user who is creating the request.
 * @param {string} impersonatedUserId - The ID of the user to be impersonated.
 * @param {string} reason - The reason for the impersonation request.
 * @returns {Promise<object>} The created impersonation request object, or an error object if validation fails.
 * @throws {Error} Logs and rethrows any error encountered during the process.
 */
export const validateImpersonationRequestService = async (
  userId: string,
  impersonatedUserId: string
) => {
  try {
      const isRequestPresent = await getImpersonationRequestByKeyValues({
      impersonatedUserId: impersonatedUserId,
      userId: userId,
      status: REQUEST_STATE.PENDING,
    });
    if (isRequestPresent){
      throw new Forbidden(REQUEST_ALREADY_PENDING)
    }

    const isApprovedImpersonatedRequestPresent = await getImpersonationRequestByKeyValues({
      impersonatedUserId: impersonatedUserId,
      userId: userId,
      status: REQUEST_STATE.APPROVED,
    });
    if (isApprovedImpersonatedRequestPresent && !isApprovedImpersonatedRequestPresent.isImpersonationFinished) {
      throw new Forbidden(IMPERSONATION_NOT_COMPLETED)
    }

  } catch (error) {
    logger.error("Error while validating the request", error);
    throw error;
  }
};


export const createImpersonationRequestService = async (body:CreateImpersonationRequestServiceBody) => {
  try {
    const { userExists, user: impersonatedUser } = await fetchUser({ userId: body.impersonatedUserId });
    if (!userExists) {
     throw new NotFound(TASK_REQUEST_MESSAGES.USER_NOT_FOUND)
    }

    const { username: createdFor } = impersonatedUser as User;

    const response = await validateImpersonationRequestService(body.userId,body.impersonatedUserId);

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

    await addLog(impersonationRequestLog.type, impersonationRequestLog.meta, impersonationRequestLog.body);

    return impersonationRequest;
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
}