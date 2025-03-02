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
import { addLog } from "./logService";
import { NotFound, Forbidden, Conflict } from "http-errors";

export const validateOOOCreateRequest = async (
    userId: string,
    userStatusExists: boolean,
    userStatus: any,
    latestOOORequest: OooStatusRequest,
) => {
    try {

        if (!userStatusExists) {
            await addLog(logType.USER_STATUS_NOT_FOUND, { userId }, {message: USER_STATUS_NOT_FOUND});
            throw NotFound(USER_STATUS_NOT_FOUND);
        }

        if (userStatus.currentStatus.state === userState.OOO) {
            await addLog(logType.STATUS_ALREADY_EXIST,
                { userId, userStatus: userState.OOO },
                { message: OOO_STATUS_ALREADY_EXIST }
            );
            throw Forbidden(OOO_STATUS_ALREADY_EXIST);
        }

        if (latestOOORequest) {
            await addLog(logType.REQUEST_ALREADY_PENDING,
                { userId, oooRequestId: latestOOORequest.id },
                { message: REQUEST_ALREADY_PENDING }
            );
            throw Conflict(REQUEST_ALREADY_PENDING);
        }
    } catch (error) {
        logger.error("Error while validating OOO create request", error);
        throw error;
    }
}

export const createOOORequest = async (
    body: OooStatusRequestBody,
    username: string,
    userId: string
) => {
    try {

        const { data: userStatus, userStatusExists } = await getUserStatus(userId);

        const latestOOORequest: OooStatusRequest = await getRequestByKeyValues({
            userId: userId,
            type: REQUEST_TYPE.OOO,
            status: REQUEST_STATE.PENDING,
        });

        await validateOOOCreateRequest(userId, userStatusExists, userStatus, latestOOORequest);

        const requestResult: OooStatusRequest = await createRequest({
            from: body.from,
            until: body.until,
            type: body.type,
            requestedBy: username,
            userId: userId,
            reason: body.reason,
            comment: null,
            status: REQUEST_STATE.PENDING,
            lastModifiedBy: null,
        });

        const requestLog = {
            type: REQUEST_LOG_TYPE.REQUEST_CREATED,
            meta: {
                requestId: requestResult.id,
                action: LOG_ACTION.CREATE,
                userId: userId,
                createdAt: Date.now(),
            },
            body: requestResult,
        };

        await addLog(requestLog.type, requestLog.meta, requestLog.body);

        return requestResult;
    } catch (error) {
        logger.error("Error while creating OOO request", error);
        throw error;
    }
}
