import { OooStatusRequestBody, OooRequestUpdateBody } from "../types/oooRequest";
import firestore from "../utils/firestore";
const oooRequestModel = firestore.collection("oooRequests");
import { REQUEST_STATE } from "../constants/request";
import { OOO_REQUEST_ALREADY_PENDING, ERROR_WHILE_CREATING_OOO_REQUEST } from "../constants/oooRequest";

export const createOooRequest = async (body: OooStatusRequestBody) => {
  try {
    const { requestedBy, from, until, message, type } = body;

    const existingOooRequest = await oooRequestModel
    .where("requestedBy", "==", requestedBy)
    .where("state", "==", REQUEST_STATE.PENDING)
      .get();

    if (!existingOooRequest.empty) {
      return {
        error: OOO_REQUEST_ALREADY_PENDING,
      };
    }
    const requestBody: OooStatusRequestBody = {
      requestedBy,
      type,
      from,
      until,
      message,
      state: REQUEST_STATE.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const result = await oooRequestModel.add(requestBody);

    return {
      id: result.id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, error);
    throw error;
  }
};

export const updateOooRequest = async (id: string, body: OooRequestUpdateBody, lastModifiedBy:string) => {
  try {
    const existingRequestDoc = await oooRequestModel.doc(id).get();
    if (!existingRequestDoc.exists) {
      return {
        error: "Request does not exist"
      };
    }
    if (existingRequestDoc.data().state === REQUEST_STATE.APPROVED) {
      return {
        error: "Request is already approved"
      };
    }
    if (existingRequestDoc.data().state === REQUEST_STATE.REJECTED) {
      return {
        error: "Request is already rejected"
      };
    }

    const requestBody: OooRequestUpdateBody = {
      updatedAt: Date.now(),
      lastModifiedBy,
      ...body,
    };
    await oooRequestModel.doc(id).update(requestBody);
    return {
      id,
      ...requestBody,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, error);
    throw error;
  }
};
