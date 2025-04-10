import { addLog } from "./logService";
import firestore from "../utils/firestore";
import { NotFound, BadRequest } from "http-errors";
import { logType } from "../constants/logs";
import {
    REQUEST_STATE,
    REQUEST_TYPE,
    REQUEST_DOES_NOT_EXIST,
    REQUEST_ALREADY_APPROVED,
    REQUEST_ALREADY_REJECTED,
    REQUEST_LOG_TYPE,
    REQUEST_APPROVED_SUCCESSFULLY,
    REQUEST_REJECTED_SUCCESSFULLY,
    LOG_ACTION,
    INVALID_REQUEST_TYPE,
} from "../constants/requests";
import { getRequests, updateRequest } from "../models/requests";
import { AcknowledgeOOORequestBody, OooStatusRequest } from "../types/oooRequest";
import { addFutureStatus } from "../models/userStatus";
const requestModel = firestore.collection("requests");

/**
 * Validates an Out-Of-Office (OOO) acknowledge request
 * 
 * @param {string} requestId - The unique identifier of the request.
 * @param {string} requestType - The type of the request (expected to be 'OOO').
 * @param {string} requestStatus - The current status of the request.
 * @throws {Error} Throws an error if an issue occurs during validation.
 */
export const validateOOOAcknowledgeRequest = async (
    requestId: string,
    requestType: string,
    requestStatus: string,
) => {

    try {

        if (requestType !== REQUEST_TYPE.OOO) {
            await addLog(logType.INVALID_REQUEST_TYPE,
                { requestId, type: requestType },
                { message: INVALID_REQUEST_TYPE }
            );
            throw BadRequest(INVALID_REQUEST_TYPE);
        }

        if (requestStatus === REQUEST_STATE.APPROVED) {
            await addLog(logType.REQUEST_ALREADY_APPROVED,
                { oooRequestId: requestId },
                { message: REQUEST_ALREADY_APPROVED }
            );
            throw BadRequest(REQUEST_ALREADY_APPROVED);
        }

        if (requestStatus === REQUEST_STATE.REJECTED) {
            await addLog(logType.REQUEST_ALREADY_REJECTED,
                { oooRequestId: requestId },
                { message: REQUEST_ALREADY_REJECTED }
            );
            throw BadRequest(REQUEST_ALREADY_REJECTED);
        }
    } catch (error) {
        logger.error("Error while validating OOO acknowledge request", error);
        throw error;
    }
}

/**
 * Acknowledges an Out-of-Office (OOO) request
 * 
 * @param {string} requestId - The ID of the OOO request to acknowledge.
 * @param {AcknowledgeOOORequestBody} body - The acknowledgement body containing acknowledging details.
 * @param {string} userId - The unique identifier of the superuser user.
 * @returns {Promise<object>} The acknowledged OOO request.
 * @throws {Error} Throws an error if an issue occurs during acknowledgment process.
 */
export const acknowledgeOOORequest = async (
    requestId: string,
    body: AcknowledgeOOORequestBody,
    superUserId: string,
) => {
    try {
        const request = await requestModel.doc(requestId).get();

        if (!request.exists) {
            await addLog(logType.REQUEST_DOES_NOT_EXIST,
                { oooRequestId: requestId },
                { message: REQUEST_DOES_NOT_EXIST }
            );
            throw NotFound(REQUEST_DOES_NOT_EXIST);
        }

        const requestData = request.data();

        await validateOOOAcknowledgeRequest(requestId, requestData.type, requestData.status);

        const requestResult = await updateRequest(requestId, body, superUserId, REQUEST_TYPE.OOO);

        if ("error" in requestResult) {
            throw BadRequest(requestResult.error);
        }

        const [acknowledgeLogType, returnMessage] =
            requestResult.status === REQUEST_STATE.APPROVED
                ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
                : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];

        const requestLog = {
            type: acknowledgeLogType,
            meta: {
                requestId: requestId,
                action: LOG_ACTION.UPDATE,
                userId: superUserId,
                createdAt: Date.now(),
            },
            body: requestResult,
        };

        await addLog(requestLog.type, requestLog.meta, requestLog.body);

        if (requestResult.status === REQUEST_STATE.APPROVED) {
            if (requestData) {
                const { from, until, userId } = requestData;
                const userFutureStatusData = {
                    requestId,
                    state: REQUEST_TYPE.OOO,
                    from,
                    endsOn: until,
                    userId,
                    message: body.comment,
                };
                await addFutureStatus(userFutureStatusData);
            }
        }

        return {
            message: returnMessage,
            data: {
                id: requestResult.id,
                ...requestResult,
            },
        };
    } catch (error) {
        logger.error("Error while acknowledging OOO request", error);
        throw error;
    }
}
