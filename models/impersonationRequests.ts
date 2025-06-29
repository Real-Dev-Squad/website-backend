import firestore from "../utils/firestore";
import {
  ERROR_WHILE_CREATING_REQUEST,
  REQUEST_ALREADY_PENDING,
  REQUEST_STATE,
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  OPERATION_NOT_ALLOWED
} from "../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import { Query, CollectionReference } from '@google-cloud/firestore';
import { CreateImpersonationRequestModelDto, ImpersonationRequest, UpdateImpersonationRequestModelDto, PaginatedImpersonationRequests,ImpersonationRequestQuery } from "../types/impersonationRequest";
import { Forbidden } from "http-errors";
const logger = require("../utils/logger");
const impersonationRequestModel = firestore.collection("impersonationRequests");
const DEFAULT_PAGE_SIZE = 5;

/**
 * Creates a new impersonation request in Firestore.
 *
 * Checks for existing requests with the same impersonatedUserId and userId that are either
 * APPROVED or PENDING and not finished. Throws a Forbidden error if such a request exists.
 *
 * @param {CreateImpersonationRequestModelDto} body - The data for the new impersonation request.
 * @returns {Promise<ImpersonationRequest>} The created impersonation request object.
 * @throws {Forbidden} If a similar request is already pending or not completed.
 * @throws {Error} Logs and rethrows any error encountered during creation.
 */
export const createImpersonationRequest = async (
  body: CreateImpersonationRequestModelDto
): Promise<ImpersonationRequest> => {
  try {
    const reqQuery = impersonationRequestModel
      .where("impersonatedUserId", "==", body.impersonatedUserId)
      .where("userId", "==", body.userId)
      .where("status", "in", ["APPROVED", "PENDING"])
      .where("isImpersonationFinished", "==", false).orderBy("createdAt", "desc").limit(1);

    const snapshot = await reqQuery.get();

    if (!snapshot.empty) {
      throw new Forbidden(OPERATION_NOT_ALLOWED);
    }

    const requestBody = {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...body,
    } as ImpersonationRequest;

    const result = await impersonationRequestModel.add(requestBody);

    return {
      id: result.id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, { error, requestData: body });
    throw error;
  }
};

/**
 * Retrieves an impersonation request by its ID.
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
    logger.error(`${ERROR_WHILE_FETCHING_REQUEST} for ID: ${id}`, error);
    throw error;
  }
};

/**
 * Retrieves a paginated list of impersonation requests based on query filters.
 * @param {object} query - The query filters.
 * @param {string} [query.createdBy] - Filter by the username of the request creator.
 * @param {string} [query.createdFor] - Filter by the username of the user the request is created for.
 * @param {string} [query.status] - Filter by request status (e.g., "APPROVED", "PENDING", "REJECTED").
 * @param {string} [query.prev] - Document ID to use as the ending point for backward pagination.
 * @param {string} [query.next] - Document ID to use as the starting point for forward pagination.
 * @param {string} [query.size] - Number of results per page.
 * @returns {Promise<PaginatedImpersonationRequests|null>} The paginated impersonation requests or null if none found.
 * @throws Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequests = async (
  query
): Promise<PaginatedImpersonationRequests | null> => {
  
  let { createdBy, createdFor, status, prev, next, size = DEFAULT_PAGE_SIZE } = query;

  size = size ? Number.parseInt(size) : DEFAULT_PAGE_SIZE;


  try {
    let requestQuery: Query<ImpersonationRequest> = impersonationRequestModel as CollectionReference<ImpersonationRequest>;

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

    if (next) {
      const doc = await impersonationRequestModel.doc(next).get();
      requestQueryDoc = requestQueryDoc.startAt(doc);
    } else if (prev) {
      const doc = await impersonationRequestModel.doc(prev).get();
      requestQueryDoc = requestQueryDoc.endAt(doc);
    }

    const snapshot = await requestQueryDoc.get();
    let nextDoc;
    let prevDoc;

    if (!snapshot.empty) {
      const first = snapshot.docs[0];
      prevDoc = await requestQuery.endBefore(first).limitToLast(1).get();
      const last = snapshot.docs[snapshot.docs.length - 1];
      nextDoc = await requestQuery.startAfter(last).limit(1).get();
    }

    const allRequests = snapshot.empty
      ? []
      : snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

    if (allRequests.length === 0) {
      return null;
    }

    const count = allRequests.length;
    return {
      allRequests,
      prev: prevDoc && !prevDoc.empty ? prevDoc.docs[0].id : null,
      next: nextDoc && !nextDoc.empty ? nextDoc.docs[0].id : null,
      count,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
}

/**
 * Updates an existing impersonation request in Firestore.
 * @param {UpdateImpersonationRequestModelDto} body - The update data for the impersonation request. Must include `id`, `lastModifiedBy`, and `updatingBody` (fields to update).
 * @returns {Promise<object>} An object containing the updated fields and the request id.
 * @throws {Error} Logs and rethrows any error encountered during update. Throws error if the request does not exist.
 */
export const updateImpersonationRequest = async ( body: UpdateImpersonationRequestModelDto ) => {
  try {
    await impersonationRequestModel.doc(body.id).update({
      updatedAt: Timestamp.now(),
      lastModifiedBy: body.lastModifiedBy,
      ...body.updatePayload,
    });

    return {
      id:body.id,
      lastModifiedBy: body.lastModifiedBy,
      ...body.updatePayload
    };
  } catch (error) {
    logger.error(`${ERROR_WHILE_UPDATING_REQUEST} for document ID: ${body.id}`, error);
    throw error;
  }
};
