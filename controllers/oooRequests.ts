import { NextFunction } from "express";
import { logType } from "../constants/logs.js";
import {
  ERROR_WHILE_ACKNOWLEDGING_REQUEST,
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  LOG_ACTION,
  OOO_STATUS_ALREADY_EXIST,
  REQUEST_ALREADY_PENDING,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_LOG_TYPE,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_STATE,
  REQUEST_TYPE,
  UNAUTHORIZED_TO_CREATE_OOO_REQUEST,
  USER_STATUS_NOT_FOUND,
} from "../constants/requests.js";
import { statusState } from "../constants/userStatus.js";
import { addLog } from "../models/logs.js";
import { getRequestByKeyValues, getRequests, updateRequest } from "../models/requests.js";
import { createUserFutureStatus } from "../models/userFutureStatus.js";
import { addFutureStatus, getUserStatus } from "../models/userStatus.js";
import { acknowledgeOooRequest, createOooRequest, validateUserStatus } from "../services/oooRequest.js";
import { CustomResponse } from "../typeDefinitions/global.js";
import { AcknowledgeOooRequest, OooRequestCreateRequest, OooRequestResponse, OooStatusRequest } from "../types/oooRequest.js";
import { UpdateRequest } from "../types/requests.js";
import logger from "../utils/logger.js";

/**
 * Controller to handle the creation of OOO requests.
 * 
 * This function processes the request to create an OOO request,
 * validates the user status, checks existing requests,
 * and stores the new request in the database with logging.
 * 
 * @param {OooRequestCreateRequest} req - The Express request object containing the body with OOO details.
 * @param {CustomResponse} res - The Express response object used to send back the response.
 * @returns {Promise<OooRequestResponse>} Resolves to a response with the success or an error message.
 */
export const createOooRequestController = async (
  req: OooRequestCreateRequest,
  res: OooRequestResponse
): Promise<OooRequestResponse> => {

  const requestBody = req.body;
  const { id: userId, username } = req.userData;
  const isUserPartOfDiscord = req.userData.roles.in_discord;
  const dev = req.query.dev === "true";

  if (!dev) return res.boom.notImplemented("Feature not implemented");

  if (!isUserPartOfDiscord) {
    return res.boom.forbidden(UNAUTHORIZED_TO_CREATE_OOO_REQUEST);
  }

  try {
    const userStatus = await getUserStatus(userId);
    const validationResponse = await validateUserStatus(userId, userStatus);

    if (validationResponse) {
      if (validationResponse.error === USER_STATUS_NOT_FOUND) {
          return res.boom.notFound(validationResponse.error);
      }
      if (validationResponse.error === OOO_STATUS_ALREADY_EXIST) {
          return res.boom.forbidden(validationResponse.error);
      }
    }

    const latestOooRequest: OooStatusRequest = await getRequestByKeyValues({
      requestedBy: userId,
      type: REQUEST_TYPE.OOO,
      status: REQUEST_STATE.PENDING,
    });

    if (latestOooRequest) {
        await addLog(logType.PENDING_REQUEST_FOUND,
            { userId, oooRequestId: latestOooRequest.id },
            { message: REQUEST_ALREADY_PENDING }
        );
        return res.boom.conflict(REQUEST_ALREADY_PENDING);
    }

    await createOooRequest(requestBody, userId);

    return res.status(201).json({
      message: REQUEST_CREATED_SUCCESSFULLY,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
  }
};

export const updateOooRequestController = async (req: UpdateRequest, res: CustomResponse) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;
  const requestId = req.params.id;
  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const requestResult = await updateRequest(requestId, requestBody, userId, REQUEST_TYPE.OOO);
    if ("error" in requestResult) {
      return res.boom.badRequest(requestResult.error);
    }
    const [logType, returnMessage] =
      requestResult.state === REQUEST_STATE.APPROVED
        ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
        : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];

    const requestLog = {
      type: logType,
      meta: {
        requestId: requestId,
        action: LOG_ACTION.UPDATE,
        userId: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);
    if (requestResult.state === REQUEST_STATE.APPROVED) {
      const requestData = await getRequests({ id: requestId });

      if (requestData) {
        const { from, until, requestedBy, message } = requestData as any;
        const userFutureStatusData = {
          requestId,
          status: REQUEST_TYPE.OOO,
          state: statusState.UPCOMING,
          from,
          endsOn: until,
          userId: requestedBy,
          message,
        };
        await createUserFutureStatus(userFutureStatusData);
        await addFutureStatus(userFutureStatusData);
      }
    }
    return res.status(201).json({
      message: returnMessage,
      data: {
        id: requestResult.id,
        ...requestResult,
      },
    });
  } catch (err) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
  }
};
/**
 * Acknowledges an Out-of-Office (OOO) request by updating its status to approved or rejected
 * 
 * @param {AcknowledgeOooRequest} req - The request object containing acknowledgment details (status, comment) and request ID in params
 * @param {OooRequestResponse} res - The response object for sending success/error responses
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<OooRequestResponse>} Resolves with success message or passes error to next middleware
 */
export const acknowledgeOooRequestController = async (
  req: AcknowledgeOooRequest,
  res: OooRequestResponse,
  next: NextFunction
)
  : Promise<OooRequestResponse> => {
    try {

      const requestBody = req.body;
      const superUserId = req.userData.id;
      const requestId = req.params.id;

      const response = await acknowledgeOooRequest(requestId, requestBody, superUserId);

      return res.status(200).json({
        message: response.message,
      });
    }
    catch(error){
      logger.error(ERROR_WHILE_ACKNOWLEDGING_REQUEST, error);
      next(error);
      return;
  }
};
