import { NextFunction } from "express";
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
  ONLY_DISCORD_USER_CREATE_OOO_REQUEST,
} from "../constants/requests";
import { statusState } from "../constants/userStatus";
import { addLog } from "../models/logs";
import { getRequests, updateRequest } from "../models/requests";
import { createUserFutureStatus } from "../models/userFutureStatus";
import { addFutureStatus } from "../models/userStatus";
import { createOOORequest } from "../services/oooRequest";
import { CustomResponse } from "../typeDefinitions/global";
import { OooStatusRequestBody, OooRequestCreateRequest } from "../types/oooRequest";
import { UpdateRequest } from "../types/requests";

export const createOooRequestController = async (req: OooRequestCreateRequest, res: CustomResponse, next: NextFunction) => {
  const requestBody = req.body as OooStatusRequestBody;
  const { id: userId, username } = req.userData;
  const isUserPartOfDiscord = req.userData.roles.in_discord;
  const dev = req.query.dev === "true";

  if (!dev) return res.boom.notImplemented("Feature not implemented");

  if (!isUserPartOfDiscord) {
    return res.boom.unauthorized(ONLY_DISCORD_USER_CREATE_OOO_REQUEST);
  }

  try {

    await createOOORequest(requestBody, username, userId);

    return res.status(201).json({
      message: REQUEST_CREATED_SUCCESSFULLY,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, err);
    next(err);
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
