import { logType } from "../constants/logs";
import { 
    LOG_ACTION,
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_LOG_TYPE,
    REQUEST_STATE,
    USER_STATUS_NOT_FOUND,
    REQUEST_TYPE,
    REQUEST_DOES_NOT_EXIST,
    REQUEST_ALREADY_APPROVED,
    REQUEST_ALREADY_REJECTED,
    REQUEST_APPROVED_SUCCESSFULLY,
    REQUEST_REJECTED_SUCCESSFULLY,
    INVALID_REQUEST_TYPE,
} from "../constants/requests";
import { userState } from "../constants/userStatus";
import { createRequest } from "../models/requests";
import { OooStatusRequest, OooStatusRequestBody } from "../types/oooRequest";
import { UserStatus } from "../types/userStatus";
import { addLog } from "./logService";
import firestore from "../utils/firestore";
import { BadRequest } from "http-errors";
import { updateRequest } from "../models/requests";
import { AcknowledgeOooRequestBody } from "../types/oooRequest";
import { addFutureStatus } from "../models/userStatus";
const requestModel = firestore.collection("requests");

/**
 * Validates the user status.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @param {UserStatus} userStatus - The status object of the user.
 * @throws {Error} Throws an error if an issue occurs during validation.
 */
export const validateUserStatus = async (
    userId: string,
    userStatus: UserStatus
) => {
    try {

        if (!userStatus.userStatusExists) {
            await addLog(logType.USER_STATUS_NOT_FOUND, { userId }, { message: USER_STATUS_NOT_FOUND });
            return {
                error: USER_STATUS_NOT_FOUND
            };
        }

        if (userStatus.data.currentStatus.state === userState.OOO) {
            await addLog(logType.OOO_STATUS_FOUND,
                { userId, userStatus: userState.OOO },
                { message: OOO_STATUS_ALREADY_EXIST }
            );
            return {
                error: OOO_STATUS_ALREADY_EXIST
            };
        }
    } catch (error) {
        logger.error("Error while validating OOO create request", error);
        throw error;
    }
}

/**
 * Create an OOO request for a user.
 * 
 * @param {OooStatusRequestBody} body - The request body containing OOO details.
 * @param {string} username - The username of the person creating the request.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<object>} The created OOO request.
 * @throws {Error} Throws an error if an issue occurs during validation.
 */
export const createOooRequest = async (
    body: OooStatusRequestBody,
    username: string,
    userId: string
) => {
    try {
        const request: OooStatusRequest = await createRequest({
            from: body.from,
            until: body.until,
            type: body.type,
            requestedBy: username,
            userId,
            reason: body.reason,
            comment: null,
            status: REQUEST_STATE.PENDING,
            lastModifiedBy: null,
        });

        const requestLog = {
            type: REQUEST_LOG_TYPE.REQUEST_CREATED,
            meta: {
                requestId: request.id,
                action: LOG_ACTION.CREATE,
                userId,
                createdAt: Date.now(),
            },
            body: request,
        };

        await addLog(requestLog.type, requestLog.meta, requestLog.body);

        return request;
    } catch (error) {
        logger.error("Error while creating OOO request", error);
        throw error;
    }
}

/**
 * Validates an Out-Of-Office (OOO) acknowledge request
 * 
 * @param {string} requestId - The unique identifier of the request.
 * @param {string} requestType - The type of the request (expected to be 'OOO').
 * @param {string} requestStatus - The current status of the request.
 * @throws {Error} Throws an error if an issue occurs during validation.
 */
export const validateOooAcknowledgeRequest = async (
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
            return {
                error: INVALID_REQUEST_TYPE
            };
        }

        if (requestStatus === REQUEST_STATE.APPROVED) {
            await addLog(logType.REQUEST_ALREADY_APPROVED,
                { oooRequestId: requestId },
                { message: REQUEST_ALREADY_APPROVED }
            );
            return {
                error: REQUEST_ALREADY_APPROVED
            };
        }

        if (requestStatus === REQUEST_STATE.REJECTED) {
            await addLog(logType.REQUEST_ALREADY_REJECTED,
                { oooRequestId: requestId },
                { message: REQUEST_ALREADY_REJECTED }
            );
            return {
                error: REQUEST_ALREADY_REJECTED
            };
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
 * @param {AcknowledgeOooRequestBody} body - The acknowledgement body containing acknowledging details.
 * @param {string} superUserId - The unique identifier of the superuser user.
 * @returns {Promise<object>} The acknowledged OOO request.
 * @throws {Error} Throws an error if an issue occurs during acknowledgment process.
 */
export const acknowledgeOooRequest = async (
    requestId: string,
    body: AcknowledgeOooRequestBody,
    superUserId: string,
) => {
    try {
        const request = await requestModel.doc(requestId).get();

        if (!request.exists) {
            await addLog(logType.REQUEST_DOES_NOT_EXIST,
                { oooRequestId: requestId },
                { message: REQUEST_DOES_NOT_EXIST }
            );
            return {
                error: REQUEST_DOES_NOT_EXIST
            };
        }

        const requestData = request.data();

        const validationResponse = await validateOooAcknowledgeRequest(requestId, requestData.type, requestData.status);

        if (validationResponse) {
            return {
                error: validationResponse.error
            };
        }

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