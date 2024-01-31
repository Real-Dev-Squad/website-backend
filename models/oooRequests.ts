import { OooStatusRequestBody } from "../types/oooRequest";
import firestore from "../utils/firestore";
const oooRestModel = firestore.collection("oooRequests");
import { REQUEST_STATE } from "../constants/request";
import { OOO_REQUEST_ALREADY_PENDING, ERROR_WHILE_CREATING_OOO_REQUEST } from "../constants/oooRequest";

export const createOooRequest = async (body: OooStatusRequestBody) => {
  try {
    const { userId, from, until, message, type } = body;

    const existingOooRequest = await oooRestModel
      .where("userId", "==", userId)
      .where("state", "==", REQUEST_STATE.PENDING)
      .get();

    if (!existingOooRequest.empty) {
      return {
        error: OOO_REQUEST_ALREADY_PENDING,
      };
    }
    const request: OooStatusRequestBody = {
      userId,
      type,
      from,
      until,
      message,
      state: REQUEST_STATE.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const doc = await oooRestModel.add(request);

    return {
      id: doc.id,
      ...request,
    };
  } catch (error) {
    logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, error);
    throw error;
  }
};