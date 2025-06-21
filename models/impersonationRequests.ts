import firestore from "../utils/firestore";
import { ERROR_WHILE_UPDATING_REQUEST } from "../constants/requests";
import { Timestamp } from "firebase-admin/firestore";
import {UpdateImpersonationRequestModelDto} from "../types/impersonationRequest";
const logger = require("../utils/logger");
const impersonationRequestModel = firestore.collection("impersonationRequests");

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
      id:body.id,
      lastModifiedBy: body.lastModifiedBy,
      ...body.updatingBody
    };
  } catch (error) {
    logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
    throw error;
  }
};
