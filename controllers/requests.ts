import {
  ERROR_WHILE_FETCHING_REQUEST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_TYPE,
} from "../constants/requests";
import { getRequests } from "../models/requests";
import { getPaginatedLink } from "../utils/helper";
import { createOooRequestController, updateOooRequestController } from "./oooRequests";
import { OooRequestCreateRequest, OooRequestResponse } from "../types/oooRequest";
import { CustomResponse } from "../typeDefinitions/global";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../types/extensionRequests";
import { createTaskExtensionRequest, updateTaskExtensionRequest } from "./extensionRequestsv2";
import { UpdateRequest } from "../types/requests";

export const createRequestController = async (
  req: OooRequestCreateRequest | ExtensionRequestRequest,
  res: CustomResponse
) => {
  const type = req.body.type;
  switch (type) {
    case REQUEST_TYPE.OOO:
      return await createOooRequestController(req as OooRequestCreateRequest, res as OooRequestResponse);
    case REQUEST_TYPE.EXTENSION:
      return await createTaskExtensionRequest(req as ExtensionRequestRequest, res as ExtensionRequestResponse);
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
