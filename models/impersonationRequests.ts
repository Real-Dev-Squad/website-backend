import firestore from "../utils/firestore";
import {
  ERROR_WHILE_CREATING_REQUEST,
  IMPERSONATION_NOT_COMPLETED,
  REQUEST_ALREADY_PENDING,
  REQUEST_STATE
} from "../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import { CreateImpersonationRequestModelDto, ImpersonationRequest } from "../types/impersonationRequest";
import { Forbidden } from "http-errors";
const logger = require("../utils/logger");

const impersonationRequestModel = firestore.collection("impersonationRequests");

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
      const request = snapshot.docs[0].data();
      const { status } = request;
      throw new Forbidden(status === REQUEST_STATE.APPROVED ? IMPERSONATION_NOT_COMPLETED : REQUEST_ALREADY_PENDING)
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