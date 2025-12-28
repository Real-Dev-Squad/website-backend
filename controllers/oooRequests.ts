import {
  REQUEST_LOG_TYPE,
  LOG_ACTION,
  REQUEST_CREATED_SUCCESSFULLY,
  ERROR_WHILE_CREATING_REQUEST,
  REQUEST_STATE,
  REQUEST_TYPE,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_ALREADY_PENDING,
  USER_STATUS_NOT_FOUND,
  OOO_STATUS_ALREADY_EXIST,
  UNAUTHORIZED_TO_CREATE_OOO_REQUEST,
  ERROR_WHILE_ACKNOWLEDGING_REQUEST,
  REQUEST_ID_REQUIRED,
} from "../constants/requests";
import { statusState } from "../constants/userStatus";
import { logType } from "../constants/logs";
import { addLog } from "../models/logs";
import { getRequestByKeyValues, getRequests, updateRequest } from "../models/requests";
import { createUserFutureStatus } from "../models/userFutureStatus";
import { getUserStatus, addFutureStatus } from "../models/userStatus";
import { createOooRequest, validateUserStatus, acknowledgeOooRequest as acknowledgeOooRequestService } from "../services/oooRequest";
import { CustomResponse } from "../typeDefinitions/global";
import { AcknowledgeOooRequest, OooRequestCreateRequest, OooRequestResponse, OooStatusRequest } from "../types/oooRequest";
import { UpdateRequest } from "../types/requests";
import { NextFunction } from "express";

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

      const response = await acknowledgeOooRequestService(requestId, requestBody, superUserId);

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
