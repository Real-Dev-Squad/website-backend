import firestore from "../utils/firestore";
import { CreateImpersonationRequestModelBody, ImpersonationRequest, PaginatedImpersonationRequests, UpdateImpersonationRequestDataBody, UpdateImpersonationRequestStatusBody } from "../types/impersonationRequests";
import { ERROR_WHILE_CREATING_REQUEST, ERROR_WHILE_FETCHING_REQUEST, ERROR_WHILE_UPDATING_REQUEST, REQUEST_DOES_NOT_EXIST} from "../constants/requests";
import {Timestamp} from "firebase-admin/firestore";
const logger = require("../utils/logger")
const impersonationRequestModel=firestore.collection("impersonationRequests");
const SIZE=5;

export const createImpersonationRequest = async (body:CreateImpersonationRequestModelBody ) : Promise<ImpersonationRequest> => {
  try {
    const requestBody: any = {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...body,
    };
    const result = await impersonationRequestModel.add(requestBody);

    return {
      id: result.id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_REQUEST, error);
    throw error;
  }
};


export const updateImpersonationRequest=async (id:string,body:UpdateImpersonationRequestStatusBody | UpdateImpersonationRequestDataBody,lastModifiedBy:string) =>{
    try{
    const existingRequestDoc=await impersonationRequestModel.doc(id).get();
    if(!existingRequestDoc.exists){
      return {
        type:"notFound",
        error: REQUEST_DOES_NOT_EXIST,
      };
    }
    const requestBody: any = {
      updatedAt: Timestamp.now(),
      lastModifiedBy,
      ...body,
    };
    await impersonationRequestModel.doc(id).update(requestBody);

    return {
      id,
      ...requestBody
    };

  }catch(error){
     logger.error(ERROR_WHILE_UPDATING_REQUEST,error);
     throw error;
  }
}

interface KeyValues{
  [key:string]:string
}

export const getImpersonationRequestById = async (query: KeyValues): Promise<ImpersonationRequest | null> => {
  const { id } = query;
  try {
    const requestDoc = await impersonationRequestModel.doc(id).get();
    if (!requestDoc.exists) {
      return null;
    }
    const data = requestDoc.data() as ImpersonationRequest;
    return {
      id: requestDoc.id,
      ...data
    };
  } catch (error) {
    logger.error(ERROR_WHILE_FETCHING_REQUEST, error);
    throw error;
   }
}


export const getImpersonationRequests = async (query) :Promise<PaginatedImpersonationRequests | null> => {
  let { createdBy, createdFor, status, prev, next, page, size = SIZE } = query;

  size = Number.parseInt(size);
  page = parseInt(page);
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


export const getImpersonationRequestByKeyValues = async (keyValues: KeyValues) : Promise<ImpersonationRequest | null> => {
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
