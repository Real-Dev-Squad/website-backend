import { logType } from "../constants/logs";
import { 
    LOG_ACTION,
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_ALREADY_PENDING,
    REQUEST_LOG_TYPE,
    REQUEST_STATE,
    REQUEST_TYPE,
    USER_STATUS_NOT_FOUND,
} from "../constants/requests";
import { userState } from "../constants/userStatus";
import { createRequest, getRequestByKeyValues } from "../models/requests";
import { getUserStatus } from "../models/userStatus";
import { OooStatusRequest, OooStatusRequestBody } from "../types/oooRequest";
import { UserStatus } from "../types/userStatus";
import { addLog } from "./logService";
import { NotFound, Forbidden, Conflict } from "http-errors";

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
            throw NotFound(USER_STATUS_NOT_FOUND);
        }

        if (userStatus.data.currentStatus.state === userState.OOO) {
            await addLog(logType.OOO_STATUS_FOUND,
                { userId, userStatus: userState.OOO },
                { message: OOO_STATUS_ALREADY_EXIST }
            );
            throw Forbidden(OOO_STATUS_ALREADY_EXIST);
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
export const createOOORequest = async (
    body: OooStatusRequestBody,
    username: string,
    userId: string
) => {
    try {

        const userStatus = await getUserStatus(userId);

        await validateUserStatus(userId, userStatus);

        const latestOOORequest: OooStatusRequest = await getRequestByKeyValues({
            userId,
            type: REQUEST_TYPE.OOO,
            status: REQUEST_STATE.PENDING,
        });

        if (latestOOORequest) {
            await addLog(logType.PENDING_REQUEST_FOUND,
                { userId, oooRequestId: latestOOORequest.id },
                { message: REQUEST_ALREADY_PENDING }
            );
            throw Conflict(REQUEST_ALREADY_PENDING);
        }

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
