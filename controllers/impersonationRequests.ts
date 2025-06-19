import { ERROR_WHILE_FETCHING_REQUEST, FEATURE_NOT_IMPLEMENTED, REQUEST_FETCHED_SUCCESSFULLY } from "../constants/requests";
import { getImpersonationRequestById, getImpersonationRequests } from "../models/impersonationRequests";
import { GetImpersonationControllerRequest, ImpersonationRequestResponse } from "../types/impersonationRequest";
import { getPaginatedLink } from "../utils/helper";
const logger = require("../utils/logger");

/**
 * Controller to fetch impersonation requests.
 *
 * @async
 * @function getImpersonationRequestsController
 * @param {GetImpersonationControllerRequest} req - Express request object containing query parameters.
 * @param {ImpersonationRequestResponse} res - Express response object.
 * @returns {Promise<ImpersonationRequestResponse>} Returns one of the following responses.
 */
export const getImpersonationRequestsController = async (
  req: GetImpersonationControllerRequest,
  res: ImpersonationRequestResponse
): Promise<ImpersonationRequestResponse> => {
  try {
    const { query } = req;

    if (query.id) {
      const request = await getImpersonationRequestById(query.id);
      if (!request) {
        return res.status(204).send();
      }
      return res.status(200).json({
        message: REQUEST_FETCHED_SUCCESSFULLY,
        data: request,
      });
    }

    const requests = await getImpersonationRequests(query);
    if (!requests || requests.allRequests.length === 0) {
      return res.status(204).send();
    }

    const { allRequests, next, prev, page } = requests;
    const count = allRequests.length;

    if (page) {
      const pageLink = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "page",
        docId: page,
      });
      return res.status(200).json({
        message: REQUEST_FETCHED_SUCCESSFULLY,
        data: allRequests,
        page: pageLink,
        count,
      });
    }

    let nextUrl = null;
    let prevUrl = null;
    if (next) {
      nextUrl = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "next",
        docId: next,
      });
    }
    if (prev) {
      prevUrl = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "prev",
        docId: prev,
      });
    }

    return res.status(200).json({
      message: REQUEST_FETCHED_SUCCESSFULLY,
      data: allRequests,
      next: nextUrl,
      prev: prevUrl,
      count,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};
