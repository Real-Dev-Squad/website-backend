import {
  REQUEST_LOG_TYPE,
  LOG_ACTION,
  REQUEST_CREATED_SUCCESSFULLY,
  ERROR_WHILE_CREATING_REQUEST,
  REQUEST_ALREADY_PENDING,
  REQUEST_STATE,
  REQUEST_TYPE,
} from "../constants/requests";
import { addLog } from "../models/logs";
import { createRequest, getRequestByKeyValues } from "../models/requests";
import { CustomResponse } from "../typeDefinitions/global";
import { OooRequestCreateRequest, OooStatusRequest } from "../types/oooRequest";

export const createOooRequestController = async (req: OooRequestCreateRequest, res: CustomResponse) => {
  const requestBody = req.body;
  const userId = req?.userData?.id;

  if (!userId) {
    return res.boom.unauthorized();
  }

  try {
    const latestOooRequest:OooStatusRequest = await getRequestByKeyValues({ requestedBy: userId, type: REQUEST_TYPE.OOO , state: REQUEST_STATE.PENDING });

    if (latestOooRequest && latestOooRequest.state === REQUEST_STATE.PENDING) {
      return res.boom.badRequest(REQUEST_ALREADY_PENDING);
    }

    const requestResult = await createRequest({ requestedBy: userId, ...requestBody });

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
  } catch (err) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
  }
};
