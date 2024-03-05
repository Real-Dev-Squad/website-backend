import {
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_STATE,
  LOG_ACTION,
  REQUEST_LOG_TYPE,
  REQUEST_TYPE,
} from "../constants/requests";
import { statusState } from "../constants/userStatus";
import { createRequest, getRequests, updateRequest } from "../models/requests";
import { addLog } from "../models/logs";
import { createUserFutureStatus } from "../models/userFutureStatus";
import {addFutureStatus} from "../models/userStatus";
import { OooStatusRequest } from "../types/oooRequest";

export const createRequestController = async (req: any, res: any) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;
  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const requestResult = await createRequest({ requestedBy: userId, ...requestBody });
    if ("error" in requestResult) {
      const requestLog = {
        type: REQUEST_LOG_TYPE.REQUEST_BLOCKED,
        meta: {
          action: LOG_ACTION.ERRORS,
          createdBy: userId,
          createdAt: Date.now(),
        },
        body: {
          error: requestResult.error,
          ...requestBody,
        },
      };
      await addLog(requestLog.type, requestLog.meta, requestLog.body);

      return res.boom.badRequest(requestResult.error);
    } else {
      const requestLog = {
        type: REQUEST_LOG_TYPE.REQUEST_CREATED,
        meta: {
          requestId: requestResult.id,
          action: LOG_ACTION.CREATE,
          createdBy: userId,
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
    }
  } catch (err) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
  }
};

export const updateRequestController = async (req: any, res: any) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;
  const requestId = req.params.id;
  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const requestResult = await updateRequest(requestId, requestBody, userId);
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
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);

    if (requestResult.state === REQUEST_STATE.APPROVED) {
      const requestData = await getRequests({ id: requestId });
      if (requestData) {
        const { from, until, requestedBy, message } = requestData as OooStatusRequest;
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

export const getRequestsController = async (req: any, res: any) => {
  const { query } = req;
  try {
    const requests = await getRequests(query);
    if (!requests) {
      return res.status(204).send();
    }
    return res.status(200).send({
      message: REQUEST_FETCHED_SUCCESSFULLY,
      data: requests,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};
