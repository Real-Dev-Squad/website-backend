import { createOooRequest } from "../models/oooRequests";
import { OooStatusRequestResponse, OooStatusRequestRequest } from "../types/oooRequest";
import { addLog } from "../models/logs";
import { CREATE, ERRORS, ERROR_WHILE_CREATING_OOO_REQUEST, OOO_LOG_TYPE, OOO_STATUS_REQUEST_CREATED_SUCCESSFULLY } from "../constants/oooRequest";

export const createOooRequestController = async (req: OooStatusRequestRequest, res: OooStatusRequestResponse) => {
    const oooRequestBody = req.body;
    const userId = req.userData.id;

    try {
        const oooRequestDoc = await createOooRequest({userId, ...oooRequestBody});
        if ('error' in oooRequestDoc) {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_BLOCKED,
                meta: {
                    action: ERRORS,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: {
                    error: oooRequestDoc.error,
                    ...oooRequestBody,
                },
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);

            return res.boom.badRequest(oooRequestDoc.error);
        } else {
            const oooRequestLog = {
                type: OOO_LOG_TYPE.OOO_REQUEST_CREATED,
                meta: {
                    oooRequestId: oooRequestDoc.id,
                    action: CREATE,
                    createdBy: userId,
                    createdAt: Date.now(),
                },
                body: oooRequestDoc,
            };
            await addLog(oooRequestLog.type, oooRequestLog.meta, oooRequestLog.body);
            return res.status(201).json({
                message: OOO_STATUS_REQUEST_CREATED_SUCCESSFULLY,
                data: {
                    id: oooRequestDoc.id,
                    ...oooRequestDoc,
                },
            });
        }
    } catch (err) {
        logger.error(ERROR_WHILE_CREATING_OOO_REQUEST, err);
        return res.boom.badImplementation(ERROR_WHILE_CREATING_OOO_REQUEST);
    }
};