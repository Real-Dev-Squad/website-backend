import { logType } from "../constants/logs";
import { 
    LOG_ACTION,
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_LOG_TYPE,
    REQUEST_STATE,
    REQUEST_TYPE,
    USER_STATUS_NOT_FOUND,
    INVALID_REQUEST_TYPE,
    REQUEST_ALREADY_APPROVED,
    REQUEST_ALREADY_REJECTED,
    REQUEST_APPROVED_SUCCESSFULLY,
    REQUEST_REJECTED_SUCCESSFULLY,
} from "../constants/requests";
import { statusState, userState } from "../constants/userStatus";
import { createRequest, getRequests, updateRequest } from "../models/requests";
import { AcknowledgeOooRequestBody, OooStatusRequest, OooStatusRequestBody } from "../types/oooRequest";
import { UserStatus } from "../types/userStatus";
import { addLog } from "./logService";
import { BadRequest, Conflict } from "http-errors";
import { addFutureStatus } from "../models/userStatus";
import { createUserFutureStatus } from "../models/userFutureStatus";

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
 * @param {string} requestedBy - The userid of the person creating the request.
 * @returns {Promise<object>} The created OOO request.
 * @throws {Error} Throws an error if an issue occurs during validation.
 */
export const createOooRequest = async (
    body: OooStatusRequestBody,
    requestedBy: string,
) => {
    try {
        const request: OooStatusRequest = await createRequest({
            from: body.from,
            until: body.until,
            type: body.type,
            requestedBy: requestedBy,
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
                userId: requestedBy,
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
 * Validate the out-of-office acknowledgement request.
 * 
 * @param {string} requestType - The type of the request (OOO or OOO_ACKNOWLEDGEMENT).
 * @param {string} requestStatus - The status of the request (PENDING, APPROVED, REJECTED).
 * @throws {Error} Throws an error if an issue occurs during validation.
 */

export const validateOooAcknowledgeRequest = async (
    requestType: string,
    requestStatus: string,
) => {
    try {
        if (requestType !== REQUEST_TYPE.OOO) {
            throw new BadRequest(INVALID_REQUEST_TYPE)
        }
        if (requestStatus === REQUEST_STATE.APPROVED) {
            throw new Conflict(REQUEST_ALREADY_APPROVED)
        }
        if (requestStatus === REQUEST_STATE.REJECTED) {
            throw new Conflict(REQUEST_ALREADY_REJECTED)
        }
    } catch (error) {
        logger.error("Error while validating OOO acknowledge request", error);
        throw error;
    }
}

/**
 * Acknowledges the OOO request.
 * 
 * @param {string} requestId - The id of the request to be acknowledged.
 * @param {AcknowledgeOooRequestBody} body - The Acknowledgement request body.
 * @param {string} superUserId - The id of the super user.
 * @returns {Promise<object>} The acknowledged OOO request.
 * @throws {Error} Throws an error if an issue occurs during acknowledgement.
 */

export const acknowledgeOooRequest = async (
    requestId: string,
    body: AcknowledgeOooRequestBody,
    superUserId: string,
) => {
    try{
        const requestData = await getRequests({ id: requestId });
        await validateOooAcknowledgeRequest(requestData.type, requestData.status);
        const requestResult = await updateRequest(requestId, body, superUserId, REQUEST_TYPE.OOO);
        if("error" in requestResult){
            throw new BadRequest(requestResult.error);
        }
        const [acknowledgeLogType, returnMessage]=
        requestResult.status === REQUEST_STATE.APPROVED ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY] : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];
        const requestLog = {
            type: acknowledgeLogType,
            meta: {
                requestId: requestId,
                action: LOG_ACTION.UPDATE,
                userId: superUserId,
            },
            body: requestResult,
        }
        await addLog(requestLog.type, requestLog.meta, requestLog.body);
        if (requestResult.status === REQUEST_STATE.APPROVED) {
            await addFutureStatus({
                requestId,
                state: REQUEST_TYPE.OOO,
                from: requestData.from,
                endsOn: requestData.until,
                userId: requestData.requestedBy,
                message: body.comment,
            });
            await createUserFutureStatus({
                requestId,
                status: userState.OOO,
                state: statusState.UPCOMING,
                from: requestData.from,
                endsOn: requestData.until,
                userId: requestData.requestedBy,
                message: body.comment,
                createdAt: Date.now()
            });
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
