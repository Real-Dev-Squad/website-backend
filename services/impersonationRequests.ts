import {
  ERROR_WHILE_CREATING_REQUEST,
  IMPERSONATION_LOG_TYPE,
  INVALID_ACTION_PARAM,
  LOG_ACTION,
  OPERATION_NOT_ALLOWED,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_LOG_TYPE,
  REQUEST_STATE,
  TASK_REQUEST_MESSAGES
} from "../constants/requests";
import { createImpersonationRequest, getImpersonationRequestById, updateImpersonationRequest } from "../models/impersonationRequests";
import { fetchUser } from "../models/users";
import { addLog } from "./logService";
import { User } from "../typeDefinitions/users";
import { NotFound, Forbidden, BadRequest } from "http-errors";
import { CreateImpersonationRequestServiceBody, ImpersonationRequest, ImpersonationSessionServiceBody, UpdateImpersonationRequestDataResponse } from "../types/impersonationRequest";
import { Timestamp } from "firebase-admin/firestore";
import config from "config";
const authService = require("../services/authService");
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
): Promise<ImpersonationRequest> => {
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
 * Starts an impersonation session.
 * Validates the request, updates the session fields, and logs the action.
 *
 * @param {ImpersonationSessionServiceBody} body - The request body containing session details.
 * @returns {Promise<{ returnMessage: string, updatedRequest: UpdateImpersonationRequestDataResponse }>} The response with a message and updated request.
 * @throws {NotFound} If the impersonation request does not exist.
 * @throws {Forbidden} If the user is not allowed to start the session.
 */
export const startImpersonationService = async (
  body: ImpersonationSessionServiceBody
): Promise<{ returnMessage: string, updatedRequest: UpdateImpersonationRequestDataResponse }> => {
  try {
    const impersonationRequest = await getImpersonationRequestById(body.requestId);
    if (!impersonationRequest) {
      throw new NotFound(REQUEST_DOES_NOT_EXIST);
    }

    if (
      body.userId !== impersonationRequest.userId ||
      impersonationRequest.status !== REQUEST_STATE.APPROVED ||
      impersonationRequest.isImpersonationFinished === true
    ) {
      throw new Forbidden(OPERATION_NOT_ALLOWED);
    }

    const updatePayload = {
      isImpersonationFinished: true,
      startedAt: Timestamp.now(),
      endedAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000)
    };

    const updatedRequest = await updateImpersonationRequest({
      id: body.requestId,
      updatePayload: updatePayload,
      lastModifiedBy: body.userId
    }) as UpdateImpersonationRequestDataResponse;

    const requestLog = {
      type: IMPERSONATION_LOG_TYPE.SESSION_STARTED,
      meta: {
        requestId: body.requestId,
        action: "START",
        startedBy: body.userId,
      },
      body: {
        ...updatedRequest,
        isImpersonationFinished: String(updatedRequest.isImpersonationFinished),
      },
    };

    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    const response = {
      returnMessage: "Impersonation session has started.",
      updatedRequest
    };
    return response;
  } catch (error) {
    logger.error("Error while starting impersonation session", error);
    throw error;
  }
};

/**
 * Stops an impersonation session.
 * Validates the request, updates the session fields, and logs the action.
 *
 * @param {ImpersonationSessionServiceBody} body - The request body containing session details.
 * @returns {Promise<{ returnMessage: string, updatedRequest: UpdateImpersonationRequestDataResponse }>} The response with a message and updated request.
 * @throws {NotFound} If the impersonation request does not exist.
 * @throws {Forbidden} If the user is not authorized to stop the session.
 */
export const stopImpersonationService = async (
  body: ImpersonationSessionServiceBody
): Promise<{ returnMessage: string, updatedRequest: UpdateImpersonationRequestDataResponse }> => {
  try {
    const impersonationRequest = await getImpersonationRequestById(body.requestId);
    if (!impersonationRequest) {
      throw new NotFound(REQUEST_DOES_NOT_EXIST);
    }
    if ( body.userId !== impersonationRequest.impersonatedUserId ) {
      throw new Forbidden(OPERATION_NOT_ALLOWED);
    }

    const newBody = { endedAt: Timestamp.now() };
    const updatedRequest = await updateImpersonationRequest({
      id: body.requestId,
      updatePayload: newBody,
      lastModifiedBy: body.userId
    }) as UpdateImpersonationRequestDataResponse;

    const requestLog = {
      type: IMPERSONATION_LOG_TYPE.SESSION_STOPPED,
      meta: {
        requestId: body.requestId,
        action: "STOP",
        stoppedBy: body.userId,
      },
      body: {
        ...updatedRequest,
        isImpersonationFinished: String(updatedRequest.isImpersonationFinished)
      },
    };

    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    const response = {
      returnMessage: "Impersonation session has been stopped.",
      updatedRequest
    };
    return response;
  } catch (error) {
    logger.error("Error while stopping impersonation session", error);
    throw error;
  }
};

/**
 * Generates an impersonation JWT token for the session.
 *
 * @param {string} requestId - The ID of the impersonation request.
 * @param {string} action - The action to perform ("START" or "STOP").
 * @returns {Promise<{ name: string, value: string, options: object }>} The cookie details with the JWT token.
 * @throws {NotFound} If the impersonation request does not exist.
 * @throws {Forbidden} If the action is not "START" or "STOP".
 */
export const generateImpersonationTokenService = async (
  requestId: string,
  action: string
): Promise<{ name: string, value: string, options: object }> => {
    try {
    const request = await getImpersonationRequestById(requestId);
    if (!request) {
      throw new NotFound(REQUEST_DOES_NOT_EXIST);
    }

    const { userId, impersonatedUserId } = request;
    const cookieName = config.get<string>("userToken.cookieName");
    const rdsUiUrl = new URL(config.get<string>("services.rdsUi.baseUrl"));
    const ttlInSeconds = Number(config.get("userToken.ttl"));

    let token: string;

    switch (action) {
      case "START":
        token = await authService.generateImpersonationAuthToken({ userId, impersonatedUserId });
        break;

      case "STOP":
        token = await authService.generateAuthToken({ userId });
        break;

      default:
        throw new BadRequest(INVALID_ACTION_PARAM);
    }

    return {
      name: cookieName,
      value: token,
      options: {
        domain: rdsUiUrl.hostname,
        expires: new Date(Date.now() + ttlInSeconds * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    };
  } catch (error) {
    logger.error(
      `Error generating impersonation token for requestId=${requestId}, action=${action}`,
      error
    );
    throw error;
  }
};