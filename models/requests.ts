import { RequestQuery } from "../types/oooRequest";
import firestore from "../utils/firestore";
const requestModel = firestore.collection("requests");
import { REQUEST_ALREADY_APPROVED, REQUEST_ALREADY_REJECTED, REQUEST_STATE } from "../constants/requests";
import {
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_ALREADY_PENDING,
} from "../constants/requests";

export const createRequest = async (body: any) => {
  try {
    const existingRequest = await requestModel
      .where("requestedBy", "==", body.requestedBy)
      .where("state", "==", REQUEST_STATE.PENDING)
      .where("type", "==", body.type)
      .get();

    if (!existingRequest.empty) {
      return {
        error: REQUEST_ALREADY_PENDING,
      };
    }
    const requestBody: any = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...body,
    };
    const result = await requestModel.add(requestBody);

    return {
      id: result.id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
};

export const updateRequest = async (id: string, body: any, lastModifiedBy: string) => {
  try {
    const existingRequestDoc = await requestModel.doc(id).get();
    if (!existingRequestDoc.exists) {
      return {
        error: REQUEST_DOES_NOT_EXIST,
      };
    }
    if (existingRequestDoc.data().state === REQUEST_STATE.APPROVED) {
      return {
        error: REQUEST_ALREADY_APPROVED,
      };
    }
    if (existingRequestDoc.data().state === REQUEST_STATE.REJECTED) {
      return {
        error: REQUEST_ALREADY_REJECTED,
      };
    }

    const requestBody: any = {
      updatedAt: Date.now(),
      lastModifiedBy,
      ...body,
    };
    await requestModel.doc(id).update(requestBody);
    return {
      id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
    throw error;
  }
};

export const getRequests = async (query: RequestQuery) => {
  const { id, type, requestedBy, state } = query;
  try {
    let query: any = requestModel;
    if (id) {
      const requestsDoc = await query.doc(id).get();
      const request = requestsDoc.data();
      if (!request) {
        return null;
      }
      return {
        id,
        ...request,
      };
    }
    if (type) {
      query = query.where("type", "==", type);
    }
    if (requestedBy) {
      query = query.where("requestedBy", "==", requestedBy);
    }
    if (state) {
      query = query.where("state", "==", state);
    }

    const requestsDoc = await query.get();
    if (requestsDoc.empty) {
      return null;
    }
    return requestsDoc.docs.map((doc: any) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};
