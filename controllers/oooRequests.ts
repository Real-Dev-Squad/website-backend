import { NextFunction } from "express";
import {
  REQUEST_LOG_TYPE,
  LOG_ACTION,
  REQUEST_CREATED_SUCCESSFULLY,
  ERROR_WHILE_CREATING_REQUEST,
  REQUEST_ALREADY_PENDING,
  REQUEST_STATE,
  REQUEST_TYPE,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_REJECTED_SUCCESSFULLY,
  UNAUTHORIZED_TO_ACKNOWLEDGE_OOO_REQUEST,
} from "../constants/requests";
import { statusState } from "../constants/userStatus";
import { addLog } from "../models/logs";
import { createRequest, getRequestByKeyValues, getRequests, updateRequest } from "../models/requests";
import { createUserFutureStatus } from "../models/userFutureStatus";
import { addFutureStatus } from "../models/userStatus";
import { acknowledgeOOORequest } from "../services/oooRequest";
import { CustomResponse } from "../typeDefinitions/global";
import { AcknowledgeOOORequest, OooRequestCreateRequest, OooRequestResponse, OooStatusRequest } from "../types/oooRequest";
import { UpdateRequest } from "../types/requests";

export const createOooRequestController = async (req: OooRequestCreateRequest, res: CustomResponse) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;

  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const latestOooRequest:OooStatusRequest = await getRequestByKeyValues({ requestedBy: userId, type: REQUEST_TYPE.OOO , state: REQUEST_STATE.PENDING });

    if (latestOooRequest && latestOooRequest.status === REQUEST_STATE.PENDING) {
      return res.boom.badRequest(REQUEST_ALREADY_PENDING);
    }

    const requestResult = await createRequest({ requestedBy: userId, ...requestBody });

    const requestLog = {
      type: REQUEST_LOG_TYPE.REQUEST_CREATED,
      meta: {
        requestId: requestResult.id,
        action: LOG_ACTION.CREATE,
        userId: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    return res.status(201).json({
      message: REQUEST_CREATED_SUCCESSFULLY,
      data: {
        id: requestResult.id,
        ...requestResult,
      },
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
 * Acknowledges an Out-of-Office (OOO) request
 * 
 * @param {AcknowledgeOOORequest} req - The request object.
 * @param {OooRequestResponse} res - The response object.
 * @returns {Promise<OooRequestResponse>} Resolves with success or failure.
 */
export const acknowledgeOOORequestController = async (
  req: AcknowledgeOOORequest,
  res: OooRequestResponse,
  next: NextFunction,
)
  : Promise<OooRequestResponse> => {

    const dev = req.query.dev === "true";

    if(!dev) return res.boom.notImplemented("Feature not implemented");

    const requestBody = req.body;
    const superUserId = req.userData.id;
    const requestId = req.params.id;
    const isSuperuser = req.userData.roles?.super_user;

    if (!isSuperuser) {
      return res.boom.forbidden(UNAUTHORIZED_TO_ACKNOWLEDGE_OOO_REQUEST);
    }

    try {

      const response = await acknowledgeOOORequest(requestId, requestBody, superUserId);

      return res.status(200).json({
        message: response.message,
      });
    }
    catch(error){
      logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
      next(error);
  }
};