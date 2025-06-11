import { ERROR_WHILE_FETCHING_REQUEST, FEATURE_NOT_IMPLEMENTED, REQUEST_FETCHED_SUCCESSFULLY } from "../constants/requests";
import { getImpersonationRequestById, getImpersonationRequests } from "../models/impersonationRequests";
import { getPaginatedLink } from "../utils/helper";
const logger = require("../utils/logger");

/**
 * Controller to handle fetching impersonation requests.
 *
 * @param {any} req - Express request object.
 * @param {any} res - Express response object.
 * @returns {Promise<void>}
 */
export const getImpersonationRequestsController = async (req: any, res: any): Promise<void> => {
  const { query } = req;
  try {
    const dev = query.dev === "true";
    if (!dev) {
      return res.boom.notImplemented(FEATURE_NOT_IMPLEMENTED);
    }

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
    if (!requests) {
      return res.status(204).send();
    }

    const { allRequests, next, prev, page } = requests;
    if (allRequests.length === 0) {
      return res.status(204).send();
    }

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
        count: count,
      });
    }

    let nextUrl = null;
    let prevUrl = null;
    if (next) {
      const nextLink = getPaginatedLink({
        endpoint: "/impersonation/requests",
        query,
        cursorKey: "next",
        docId: next,
      });
      nextUrl = nextLink;
    }
    if (prev) {
      const prevLink = getPaginatedLink({
        endpoint: "/impersonation/requests",
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
      count: count,
    });
  } catch (err) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, err);
    return res.boom.badImplementation(ERROR_WHILE_FETCHING_REQUEST);
  }
};