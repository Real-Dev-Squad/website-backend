import { ERROR_WHILE_FETCHING_REQUEST } from "../constants/requests";
import { ImpersonationRequest, PaginatedImpersonationRequests } from "../types/impersonationRequest";
import firestore from "../utils/firestore";
const impersonationRequestModel = firestore.collection("impersonationRequests");
const SIZE = 5;
const logger = require("../utils/logger");

/**
 * Retrieves an impersonation request by its ID.
 *
 * @param {string} id - The ID of the impersonation request to retrieve.
 * @returns {Promise<ImpersonationRequest|null>} The found impersonation request or null if not found.
 * @throws {Error} Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequestById = async (
  id: string
): Promise<ImpersonationRequest | null> => {
  try {
    const requestDoc = await impersonationRequestModel.doc(id).get();
    if (!requestDoc.exists) {
      return null;
    }
    const data = requestDoc.data() as ImpersonationRequest;
    return {
      id: requestDoc.id,
      ...data,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};

/**
 * Retrieves a paginated list of impersonation requests based on query filters.
 *
 * @param {object} query - The query filters (createdBy, createdFor, status, prev, next, page, size).
 * @returns {Promise<PaginatedImpersonationRequests|null>} The paginated impersonation requests or null if none found.
 * @throws {Error} Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequests = async (
  query
): Promise<PaginatedImpersonationRequests | null> => {
  let { createdBy, createdFor, status, prev, next, page, size = SIZE } = query;
  size = Number.parseInt(size);
  page = Number.parseInt(page);
  try {
    let requestQuery: any = impersonationRequestModel;
    if (createdBy) {
      requestQuery = requestQuery.where("createdBy", "==", createdBy);
    }
    if (status) {
      requestQuery = requestQuery.where("status", "==", status);
    }
    if (createdFor) {
      requestQuery = requestQuery.where("createdFor", "==", createdFor);
    }
    requestQuery = requestQuery.orderBy("createdAt", "desc");
    let requestQueryDoc = requestQuery;
    if (prev) {
      requestQueryDoc = requestQueryDoc.limitToLast(size);
    } else {
      requestQueryDoc = requestQueryDoc.limit(size);
    }
    if (page) {
      const startAfter = (page - 1) * size;
      requestQueryDoc = requestQueryDoc.offset(startAfter);
    }
    if (next) {
      const doc = await impersonationRequestModel.doc(next).get();
      requestQueryDoc = requestQueryDoc.startAt(doc);
    } else if (prev) {
      const doc = await impersonationRequestModel.doc(prev).get();
      requestQueryDoc = requestQueryDoc.endAt(doc);
    }
    const snapshot = await requestQueryDoc.get();
    let nextDoc: any, prevDoc: any;
    if (!snapshot.empty) {
      const first = snapshot.docs[0];
      prevDoc = await requestQuery.endBefore(first).limitToLast(1).get();
      const last = snapshot.docs[snapshot.docs.length - 1];
      nextDoc = await requestQuery.startAfter(last).limit(1).get();
    }
    let allRequests: ImpersonationRequest[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((doc: any) => {
        allRequests.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }
    if (allRequests.length === 0) {
      return null;
    }
    const count = allRequests.length;
    return {
      allRequests,
      prev: prevDoc && !prevDoc.empty ? prevDoc.docs[0].id : null,
      next: nextDoc && !nextDoc.empty ? nextDoc.docs[0].id : null,
      page: page ? page + 1 : null,
      count,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};