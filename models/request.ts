const firestore = require("../utils/firestore");
const requestModel = firestore.collection("requests");
import { AddRequestBody, UpdateRequestBody, RequestType, GetRequestsParams } from "../types/requests";

/**
 * addRequest adds a request to the database
 * @param requestBody: AddRequestBody
 * @returns RequestType
 */
export const addRequest = async (requestBody: AddRequestBody) => {
  const { typeId, type, state, requestedBy } = requestBody;
  try {
    const data = {
      typeId,
      type,
      state,
      requestedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const request = await requestModel.add(data);
    return {
      requestId: request.id,
      ...data,
    } as RequestType;
  } catch (err) {
    logger.error("Error while adding request", err);
    throw new Error("Error adding request");
  }
};

/**
 * updateRequest updates a request in the database
 * @param requestBody: UpdateRequestBody
 * @returns RequestType
 **/
export const updateRequest = async (requestBody: UpdateRequestBody) => {
  try {
    const request = await requestModel.doc(requestBody.requestId)
      .update({
        lastUpdatedBy: requestBody.lastUpdatedBy,
        reason: requestBody.reason,
        updatedAt: new Date(),
      });
    return {
      requestId: request.id,
      ...request,
    } as RequestType;
  } catch (err) {
    logger.error("Error while updating request", err);
    throw new Error("Error updating request");
  }
}


/**
 * getRequest paginated requests from the database
 * @param next: string, default null
 * @param prev: string, default null
 * @param page: number, default 1
 * @param size: number, default 10
 * @param type: string, default null
 * @param state: string, default null
 * @param requestedBy: string, default null
 * @returns RequestType[]
 **/

export const getRequests = async (params: GetRequestsParams) => {
  const { next, prev,page, size, type, state, requestedBy } = params;
  try {
    let query = requestModel.orderBy("createdAt", "desc");
    if (type) {
      query = query.where("type", "==", type);
    }
    if (state) {
      query = query.where("state", "==", state);
    }
    if (requestedBy) {
      query = query.where("requestedBy", "==", requestedBy);
    }
    let queryDoc = query;
    if(prev) {
      queryDoc = query.limitToLast(size);
    } else {
      queryDoc = query.limit(size);
    }
    if(page) {
      const startAfter = size * page ;
      queryDoc = queryDoc.offset(startAfter);
    } else if (next) {
      const doc = await requestModel.doc(next).get();
      queryDoc = queryDoc.startAt(doc);
    } else if (prev) {
      const doc = await requestModel.doc(prev).get();
      queryDoc = queryDoc.endAt(doc);
    }

    const requestsSnapshot = await queryDoc.get();
    let nextdoc, prevdoc;
    if(requestsSnapshot.size){
      const first = requestsSnapshot.docs[0];
      prevdoc = await queryDoc.endBefore(first).limitToLast(1).get();

      const last = requestsSnapshot.docs[requestsSnapshot.docs.length - 1];
      nextdoc = await queryDoc.startAfter(last).limit(1).get();
    }

    const allRequests = requestsSnapshot.docs.map((doc) => {
      return {
        requestId: doc.id,
        ...doc.data(),
      } as RequestType;
    });

  } catch (err) {
    logger.error("Error while getting requests", err);
    throw new Error("Error getting requests");
  }
}