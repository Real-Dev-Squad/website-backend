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
import { AcknowledgeOOORequestBody } from "../types/oooRequest";
import { statusState } from "../constants/userStatus";
import { createUserFutureStatus } from "../models/userFutureStatus";
import { addFutureStatus } from "../models/userStatus";
const requestModel = firestore.collection("requests");

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

export const acknowledgeOOORequest = async (
    requestId: string,
    body: AcknowledgeOOORequestBody,
    userId: string,
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

        const requestResult = await updateRequest(requestId, body, userId, REQUEST_TYPE.OOO);

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
                userId: userId,
                createdAt: Date.now(),
            },
            body: requestResult,
        };

        await addLog(requestLog.type, requestLog.meta, requestLog.body);

        if (requestResult.status === REQUEST_STATE.APPROVED) {
            const requestData = await getRequests({ id: requestId });

            if (requestData) {
                const { from, until, requestedBy, comment } = requestData as any;
                const userFutureStatusData = {
                    requestId,
                    status: REQUEST_TYPE.OOO,
                    state: statusState.UPCOMING,
                    from,
                    endsOn: until,
                    userId: requestedBy,
                    message: comment,
                };
                await createUserFutureStatus(userFutureStatusData);
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
