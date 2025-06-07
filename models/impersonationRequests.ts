import firestore from "../utils/firestore";
import { ERROR_WHILE_CREATING_REQUEST, ERROR_WHILE_FETCHING_REQUEST } from "../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import { CreateImpersonationRequestModelDto, ImpersonationRequest } from "../types/impersonationRequest";
const logger = require("../utils/logger");
const impersonationRequestModel = firestore.collection("impersonationRequests");
const SIZE = 5;

/**
 * Creates a new impersonation request in Firestore.
 * @async
 * @function createImpersonationRequest
 * @param {CreateImpersonationRequestModelDto} body - The data for the new impersonation request.
 * @returns {Promise<ImpersonationRequest>} The created impersonation request object.
 * @throws Will log and rethrow any error encountered during creation.
 */
export const createImpersonationRequest = async (
  body: CreateImpersonationRequestModelDto
): Promise<ImpersonationRequest> => {
  try {
    const result = await impersonationRequestModel.add({
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...body,
    });
    const doc = (await result.get()).data() as ImpersonationRequest;
    return {
      id: result.id,
      ...doc,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
};

interface KeyValues {
  [key: string]: string;
}

/**
 * Retrieves an impersonation request by key-value pairs.
 * @async
 * @function getImpersonationRequestByKeyValues
 * @param {KeyValues} keyValues - The key-value pairs to filter the request.
 * @returns {Promise<ImpersonationRequest | null>} The found impersonation request or null if not found.
 * @throws Will log and rethrow any error encountered during fetch.
 */
export const getImpersonationRequestByKeyValues = async (
  keyValues: KeyValues
): Promise<ImpersonationRequest | null> => {
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
}