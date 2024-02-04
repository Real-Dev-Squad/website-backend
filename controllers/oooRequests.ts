import { createOooRequest, updateOooRequest, getOooRequests } from "../models/oooRequests";
import { OooRequestCreateRequest, OooRequestResponse, OooRequestUpdateRequest } from "../types/oooRequest";
import { addLog } from "../models/logs";
import {
    ERROR_WHILE_CREATING_OOO_REQUEST,
    ERROR_WHILE_UPDATING_OOO_REQUEST,
    LOG_ACTION,
    OOO_LOG_TYPE,
    OOO_STATUS_REQUEST_CREATED_SUCCESSFULLY,
    OOO_STATUS_REQUEST_UPDATED_SUCCESSFULLY,
} from "../constants/oooRequest";
import { REQUEST_STATE } from "../constants/request";

export const createOooRequestController = async (
    req: OooRequestCreateRequest, res: OooRequestResponse) => {
    const oooRequestBody = req.body;
    const userId = req?.userData?.id;
    if (!userId) {
        return res.boom.unauthorized();
    }

    try {
        const oooRequestResult = await createOooRequest({ requestedBy: userId, ...oooRequestBody });
        if ('error' in oooRequestResult) {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_BLOCKED,
                meta: {
                    action: LOG_ACTION.ERRORS,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: {
                    error: oooRequestResult.error,
                    ...oooRequestBody,
                },
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);

            return res.boom.badRequest(oooRequestResult.error);
        } else {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_CREATED,
                meta: {
                    oooRequestId: oooRequestResult.id,
                    action: LOG_ACTION.CREATE,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: oooRequestResult,
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);
            return res.status(201).json({
                message: OOO_STATUS_REQUEST_CREATED_SUCCESSFULLY,
                data: {
                    id: oooRequestResult.id,
                    ...oooRequestResult,
                },
            });
        }
    } catch (err) {
        logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, err);
        return res.boom.badImplementation(ERROR_WHILE_CREATING_OOO_REQUEST);
    }
}

export const updateOooRequestController = async (req: OooRequestUpdateRequest, res: OooRequestResponse) => {
    const oooRequestBody = req.body;
    const userId = req?.userData?.id;
    const oooRequestId = req.params.id;
    if (!userId) {
        return res.boom.unauthorized();
    }

    try {
        const oooRequestResult = await updateOooRequest(oooRequestId, oooRequestBody, userId);
        if ('error' in oooRequestResult) {
            return res.boom.badRequest(oooRequestResult.error);
        }
        if (oooRequestResult.state === REQUEST_STATE.REJECTED) {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_REJECTED,
                meta: {
                    action: LOG_ACTION.ERRORS,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: {
                    ...oooRequestResult,
                },
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);
            return res.status(201).json({
                message: OOO_STATUS_REQUEST_UPDATED_SUCCESSFULLY,
                data: {
                    id: oooRequestId,
                    ...oooRequestResult,
                },
            });

        } else {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_APPROVED,
                meta: {
                    oooRequestId: oooRequestId,
                    action: LOG_ACTION.UPDATE,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: oooRequestResult,
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);
            return res.status(201).json({
                message: OOO_STATUS_REQUEST_UPDATED_SUCCESSFULLY,
                data: {
                    id: oooRequestId,
                    ...oooRequestResult,
                },
            });
        }
    } catch (err) {
        logger.error(ERROR_WHILE_UPDATING_OOO_REQUEST, err);
        return res.boom.badImplementation(ERROR_WHILE_UPDATING_OOO_REQUEST);
    }
};

export const getOooRequestsController = async (req: OooRequestCreateRequest, res: OooRequestResponse) => {
    const { query } = req;

    try {
        const oooRequests = await getOooRequests(
            query.type,
            query.requestedBy,
            query.state
        );
        return oooRequests;
    } catch (err) {
        logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, err);
        return res.boom.badImplementation(ERROR_WHILE_CREATING_OOO_REQUEST);
    }
};
