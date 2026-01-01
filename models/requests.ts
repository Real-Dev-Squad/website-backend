import firestore from "../utils/firestore";
const requestModel = firestore.collection("requests");
import { REQUEST_ALREADY_APPROVED, REQUEST_ALREADY_REJECTED, REQUEST_STATE } from "../constants/requests";
import {
  ERROR_WHILE_FETCHING_REQUEST,
  ERROR_WHILE_CREATING_REQUEST,
  ERROR_WHILE_UPDATING_REQUEST,
  REQUEST_DOES_NOT_EXIST,
} from "../constants/requests";
import { getUserId } from "../utils/users";
import { transformRequestResponse } from "../utils/requests";
const SIZE = 5;


export const createRequest = async (body: any) => {
  try {
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

export const updateRequest = async (id: string, body: any, lastModifiedBy: string, type:string) => {
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
    if (existingRequestDoc.data().type !== type) {
      return {
        error: REQUEST_DOES_NOT_EXIST,
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

export const getRequests = async (query: any) => {
  let { id, type, requestedBy, state, prev, next, page, size = SIZE } = query;
  const dev = query.dev === "true";

  size = parseInt(size);
  page = parseInt(page);
  try {
    let requestQuery: any = requestModel;

    if (id) {
      const requestDoc = await requestModel.doc(id).get();
      if (!requestDoc.exists) {
        return null;
      }
      return {
        id: requestDoc.id,
        ...requestDoc.data(),
      };
    }
    
    if(requestedBy && dev){
      requestQuery = requestQuery.where("requestedBy", "==", requestedBy);
    }
    else if (requestedBy) {
      const requestedByUserId = await getUserId(requestedBy);
      requestQuery = requestQuery.where("requestedBy", "==", requestedByUserId);
    }

    if (type) {
      requestQuery = requestQuery.where("type", "==", type);
    }
    if (state) {
      requestQuery = requestQuery.where("state", "==", state);
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
    } else if (next) {
      const doc = await requestModel.doc(next).get();
      requestQueryDoc = requestQueryDoc.startAt(doc);
    } else if (prev) {
      const doc = await requestModel.doc(prev).get();
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

    allRequests = transformRequestResponse(allRequests);

    return {
      allRequests,
      prev: prevDoc.empty ? null : prevDoc.docs[0].id,
      next: nextDoc.empty ? null : nextDoc.docs[0].id,
      page: page ? page + 1 : null,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};

interface KeyValues {
  [key: string]: string;
}

export const getRequestByKeyValues = async (keyValues: KeyValues) => {
  try {
    let requestQuery: any = requestModel;
    Object.entries(keyValues).forEach(([key, value]) => {
      requestQuery = requestQuery.where(key, "==", value);
    });

    const requestQueryDoc = await requestQuery.orderBy("createdAt", "desc").limit(1).get();
    if (requestQueryDoc.empty) {
      return null;
    }

    let requests: any;
    requestQueryDoc.forEach((doc: any) => {
      requests = {
        id: doc.id,
        ...doc.data(),
      };
    });
    return requests;
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
  }
};

