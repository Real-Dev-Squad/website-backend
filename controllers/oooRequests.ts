import { createOooRequest } from "../models/oooRequests";
import { OooRequestCreateRequest, OooRequestResponse } from "../types/oooRequest";
import { addLog } from "../models/logs";
import { CREATE, ERRORS, ERROR_WHILE_CREATING_OOO_REQUEST, OOO_LOG_TYPE, OOO_STATUS_REQUEST_CREATED_SUCCESSFULLY } from "../constants/oooRequest";

export const createOooRequestController = async (req: OooRequestCreateRequest, res: OooRequestResponse) => {
    const oooRequestBody = req.body;
    const userId = req?.userData?.id;
    if (!userId) {
        return res.boom.unauthorized();
    }

    try {
        const oooRequestResult = await createOooRequest({userId, ...oooRequestBody});
        if ('error' in oooRequestResult) {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_BLOCKED,
                meta: {
                    action: ERRORS,
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
                    action: CREATE,
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
};
