import { Request } from "express";
import {
  ERROR_WHILE_FETCHING_REQUEST,
  REQUEST_FETCHED_SUCCESSFULLY,
  REQUEST_TYPE,
} from "../constants/requests.js";
import { getRequests } from "../models/requests.js";
import { getPaginatedLink } from "../utils/helper.js";
import { createOooRequestController, updateOooRequestController } from "./oooRequests.js";
import { OooRequestCreateRequest, OooRequestResponse } from "../types/oooRequest.js";
import { CustomResponse } from "../typeDefinitions/global.js";
import { ExtensionRequestRequest, ExtensionRequestResponse } from "../types/extensionRequests.js";
import { createTaskExtensionRequest, updateTaskExtensionRequest } from "./extensionRequestsv2.js";
import { UpdateRequest } from "../types/requests.js";
import { TaskRequestRequest } from "../types/taskRequests.js";
import { createTaskRequestController } from "./taskRequestsv2.js";
import { OnboardingExtensionCreateRequest, OnboardingExtensionResponse, UpdateOnboardingExtensionStateRequest } from "../types/onboardingExtension.js";
import { createOnboardingExtensionRequestController, updateOnboardingExtensionRequestController, updateOnboardingExtensionRequestState } from "./onboardingExtension.js";
import { UpdateOnboardingExtensionRequest } from "../types/onboardingExtension.js";
import logger from "../utils/logger.js";

export const createRequestController = async (
  req: OooRequestCreateRequest | ExtensionRequestRequest | TaskRequestRequest | OnboardingExtensionCreateRequest,
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
    case REQUEST_TYPE.ONBOARDING:
      return await createOnboardingExtensionRequestController(req as OnboardingExtensionCreateRequest, res as OnboardingExtensionResponse);
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
    case REQUEST_TYPE.ONBOARDING:
      return await updateOnboardingExtensionRequestState(req as unknown as UpdateOnboardingExtensionStateRequest, res as OnboardingExtensionResponse);
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

       if (query.id) {
         return res.status(200).json({
           message: REQUEST_FETCHED_SUCCESSFULLY,
           data: requests,
         });
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

/**
 * Processes update requests before acknowledgment based on type.
 *
 * @param {Request} req - The request object.
 * @param {CustomResponse} res - The response object.
 * @returns {Promise<void>} Resolves or sends an error for invalid types.
 */
export const updateRequestBeforeAcknowledgedController = async (req: Request, res: CustomResponse, next: NextFunction) => {
  const type = req.body.type;
  switch(type){
    case REQUEST_TYPE.OOO:
      await acknowledgeOooRequestController(req as AcknowledgeOooRequest, res as OooRequestResponse, next);
      break;
    case REQUEST_TYPE.ONBOARDING:
      await updateOnboardingExtensionRequestController(req as UpdateOnboardingExtensionRequest, res as OnboardingExtensionResponse);
      break;
    default:
      return res.boom.badRequest("Invalid request");
  }
}
