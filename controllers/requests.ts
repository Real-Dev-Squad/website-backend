import {
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_STATE,
  LOG_ACTION,
  REQUEST_LOG_TYPE,
  REQUEST_TYPE,
} from "../constants/requests";
import { statusState } from "../constants/userStatus";
import {addFutureStatus} from "../models/userStatus";
import { createUserFutureStatus } from "../models/userFutureStatus";
import { getRequests, updateRequest } from "../models/requests";
import { addLog } from "../models/logs";
import { getPaginatedLink } from "../utils/helper";
import { createOooRequestController } from "./oooRequests";
import { OooRequestCreateRequest, OooRequestResponse } from "../types/oooRequest";
// import {createTaskExtensionRequest} from "./extensionRequestsv2";
import { CustomResponse } from "../typeDefinitions/global";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../types/extensionRequests";

export const createRequestController = async (req: OooRequestCreateRequest | ExtensionRequestRequest
  , res: CustomResponse) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await createOooRequestController(req as OooRequestCreateRequest, res as OooRequestResponse);
      // TODO: Will be implemented in next PR
    // case REQUEST_TYPE.EXTENSION:
      // return await createTaskExtensionRequest(req as ExtensionRequestRequest, res as ExtensionRequestResponse);
    default:
      return res.boom.badRequest("Invalid request type");
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

export const getRequestsController = async (req: any, res: any) => {
  const { query } = req;
  try {
    const requests = await getRequests(query);
    if (!requests) {
      return res.status(204).send();
    }

    const { allRequests, next, prev, page } = requests;
    if (allRequests.length === 0) {
      return res.status(204).send();
    }

    if(page) {
      const pageLink = `/requests?page=${page}&dev=${query.dev}`;
      return res.status(200).json({
        message: REQUEST_FETCHED_SUCCESSFULLY,
        data: allRequests,
        page: pageLink,
      });
    }

    let nextUrl = null;
    let prevUrl = null;
    if (next) {
      const nextLink = getPaginatedLink({
        endpoint: "/requests",
        query,
        cursorKey: "next",
        docId: next,
      });
      nextUrl = nextLink;
    }
    if (prev) {
      const prevLink = getPaginatedLink({
        endpoint: "/requests",
        query,
        cursorKey: "prev",
        docId: prev,
      });
      prevUrl = prevLink;
    }

    return res.status(200).json({
      message: REQUEST_FETCHED_SUCCESSFULLY,
      data: allRequests,
      next: nextUrl,
      prev: prevUrl,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};
