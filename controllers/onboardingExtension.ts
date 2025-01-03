import firestore from "../utils/firestore";
import { CustomResponse } from "../types/global";
import { UpdateOnboardingExtensionRequest, UpdateOnboardingExtensionRequestBody } from "../types/onboardingExtension";
import { ERROR_WHILE_UPDATING_REQUEST, LOG_ACTION, REQUEST_DOES_NOT_EXIST, REQUEST_LOG_TYPE, REQUEST_STATE } from "../constants/requests";
import { addLog } from "../models/logs";
const requestModel = firestore.collection("requests");

export const updateOnboardingExtensionRequestController = async (req: UpdateOnboardingExtensionRequest, res: CustomResponse) => {
    const body = req.body as UpdateOnboardingExtensionRequestBody;
    const id = req.params.id;
    const lastModifiedBy = req?.userData?.id;
    const dev = req.query.dev === "true";

    if(!dev) return res.boom.notImplemented("Feature not implemented");

    try{
        const extensionRequestDoc = await requestModel.doc(id).get();

        if(!extensionRequestDoc.exists){
            return res.boom.notFound(REQUEST_DOES_NOT_EXIST);
        }

        const extensionRequest = extensionRequestDoc.data();

        if(extensionRequest.oldEndsOn > body.newEndsOn) {
            return res.boom.badRequest("Request new deadline must be greater than old deadline.");
        }
    
        if(extensionRequest.state != REQUEST_STATE.PENDING){
            return res.boom.badRequest("Request state is not pending");
        }
    
        const requestBody = {
            ...body, 
            lastModifiedBy,
            updatedAt: Date.now(),
        }
    
        await requestModel.doc(id).update(requestBody);
    
        const requestLog = {
            type: REQUEST_LOG_TYPE.REQUEST_UPDATED,
            meta: {
                requestId: extensionRequest.id,
                action: LOG_ACTION.UPDATE,
                createdBy: lastModifiedBy,
                createdAt: Date.now(),
            },
            body: requestBody,
        };
    
        await addLog(requestLog.type, requestLog.meta, requestLog.body);
        
        return res.status(200).json({
            message: "Request updated successfully",
            data: {
            id: extensionRequest.id,
            ...requestBody
            }
        })
    }catch(error){
        logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
        return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
    }
}