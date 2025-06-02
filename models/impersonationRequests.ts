import firestore from "../utils/firestore";
import { ERROR_WHILE_CREATING_REQUEST, ERROR_WHILE_FETCHING_REQUEST, ERROR_WHILE_UPDATING_REQUEST, REQUEST_DOES_NOT_EXIST } from "../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import { CreateImpersonationRequestModelDto, ImpersonationRequest, PaginatedImpersonationRequests, UpdateImpersonationRequestModelDto } from "../types/impersonationRequest";
import { NotFound } from "http-errors";
const logger = require("../utils/logger");
const impersonationRequestModel = firestore.collection("impersonationRequests");
const SIZE = 5;

/**
 * Creates a new impersonation request in Firestore.
 * @param {CreateImpersonationRequestModelDto} body - The data for the new impersonation request.
 * @returns {Promise<ImpersonationRequest>} The created impersonation request object.
 * @throws Logs and rethrows any error encountered during creation.
 */
export const createImpersonationRequest = async ( body: CreateImpersonationRequestModelDto ) => {
  try {
    const result = await impersonationRequestModel.add({
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...body,
    });
    const doc = await result.get();
    return {
      id: result.id,
      ...doc.data(),
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
};

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
      ...body.updatingBody,
    });

    return {
      id: body.id,
      ...body.updatingBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
    throw error;
  }
};

/**
 * Retrieves an impersonation request by its ID.
 * @param {string} id - The ID of the impersonation request to retrieve.
 * @returns {Promise<ImpersonationRequest|null>} The found impersonation request or null if not found.
 * @throws {Error} Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequestById = async ( id: string ): Promise<ImpersonationRequest | null> => {
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
 * @param {object} query - The query filters (createdBy, createdFor, status, prev, next, page, size).
 * @returns {Promise<PaginatedImpersonationRequests|null>} The paginated impersonation requests or null if none found.
 * @throws Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequests = async ( query ): Promise<PaginatedImpersonationRequests | null> => {
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
    let allRequests = [];
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
      prev: prevDoc.empty ? null : prevDoc.docs[0].id,
      next: nextDoc.empty ? null : nextDoc.docs[0].id,
      page: page ? page + 1 : null,
      count,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};

interface KeyValues {
  [key: string]: string;
}

/**
 * Retrieves an impersonation request by key-value pairs.
 * @param {KeyValues} keyValues - The key-value pairs to filter the request.
 * @returns {Promise<ImpersonationRequest | null>} The found impersonation request or null if not found.
 * @throws Logs and rethrows any error encountered during fetch.
 */
export const getImpersonationRequestByKeyValues = async ( keyValues: KeyValues ): Promise<ImpersonationRequest | null> => {
  try {
    let requestQuery: any = impersonationRequestModel;
    Object.entries(keyValues).forEach(([key, value]) => {
      requestQuery = requestQuery.where(key, "==", value);
    });

    const requestQueryDoc = await requestQuery.orderBy("createdAt", "desc").limit(1).get();
    if (requestQueryDoc.empty) {
      return null;
    }
    let request: any;
    requestQueryDoc.forEach((doc: any) => {
      request = {
        id: doc.id,
        ...doc.data(),
      };
    });
    
    return request;
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};
