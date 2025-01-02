import firestore from "../utils/firestore";
import {
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  LOG_ACTION,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_LOG_TYPE,
  REQUEST_STATE,
  REQUEST_TYPE,
} from "../constants/requests";
import { getRequests } from "../models/requests";
import { getPaginatedLink } from "../utils/helper";
import { createOooRequestController, updateOooRequestController } from "./oooRequests";
import { OooRequestCreateRequest, OooRequestResponse } from "../types/oooRequest";
import { CustomResponse } from "../typeDefinitions/global";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../types/extensionRequests";
import { createTaskExtensionRequest, updateTaskExtensionRequest } from "./extensionRequestsv2";
import { UpdateRequest, UpdateRequestBeforeApproval } from "../types/requests";
import { TaskRequestRequest } from "../types/taskRequests";
import { createTaskRequestController } from "./taskRequestsv2";
import { addLog } from "../models/logs";
const requestModel = firestore.collection("requests");

export const createRequestController = async (
  req: OooRequestCreateRequest | ExtensionRequestRequest | TaskRequestRequest,
  res: CustomResponse
) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await createOooRequestController(req as OooRequestCreateRequest, res as OooRequestResponse);
    case REQUEST_TYPE.EXTENSION:
      return await createTaskExtensionRequest(req as ExtensionRequestRequest, res as ExtensionRequestResponse);
    case REQUEST_TYPE.TASK:
      return await createTaskRequestController(req as TaskRequestRequest, res as CustomResponse);
    default:
      return res.boom.badRequest("Invalid request type");
  }
};

export const updateRequestController = async (req: UpdateRequest, res: CustomResponse) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await updateOooRequestController(req as UpdateRequest, res as ExtensionRequestResponse);
    case REQUEST_TYPE.EXTENSION:
      return await updateTaskExtensionRequest(req as UpdateRequest, res as ExtensionRequestResponse);
    default:
      return res.boom.badRequest("Invalid request type");
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

    if (page) {
      const pageLink = `/requests?page=${page}`;
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

export const updateRequestBeforeApprovalController = async (req: UpdateRequestBeforeApproval, res: CustomResponse) => {
  const body = req.body;
  const id = req.params.id;
  const lastModifiedBy = req?.userData?.id;

  try{
    const extensionRequest = await requestModel.doc(id).get() as unknown as {id: string, oldEndsOn: number, state: string};

    if(!extensionRequest){
      return res.boom.notFound(REQUEST_DOES_NOT_EXIST);
    }
    
    if(extensionRequest.oldEndsOn > body.newEndsOn) {
      return res.boom.badRequest("Request new deadline must be greater than old deadline.");
    }

    if(extensionRequest.state != REQUEST_STATE.PENDING){
      return res.boom.badRequest("Request state is not pending");
    }

    const requestBody = {
      ...body, 
      lastModifiedBy,
      updatedAt: Date.now(),
    }

    await requestModel.doc(id).update(requestBody);

    const requestLog = {
      type: REQUEST_LOG_TYPE.REQUEST_UPDATED,
      meta: {
          requestId: extensionRequest.id,
          action: LOG_ACTION.UPDATE,
          createdBy: lastModifiedBy,
          createdAt: Date.now(),
      },
      body: requestBody,
    };

    await addLog(requestLog.type, requestLog.meta, requestLog.body);
    
    return res.status(200).json({
      message: "Request updated successfully",
      data: {
        id: extensionRequest.id,
        ...requestBody
      }
    })
  }catch(error){
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
    return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
  }
}