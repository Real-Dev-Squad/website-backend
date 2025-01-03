import { ERROR_WHILE_UPDATING_REQUEST, LOG_ACTION, REQUEST_APPROVED_SUCCESSFULLY, REQUEST_LOG_TYPE, REQUEST_REJECTED_SUCCESSFULLY, REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";
import { addLog } from "../models/logs";
import { updateRequest } from "../models/requests";
import { OnboardingExtensionResponse, UpdateOnboardingExtensionRequest, UpdateOnboardingExtensionRequestBody } from "../types/onboardingExtension";

/**
 * Updates the status of an onboarding extension request.
 *
 * @param {UpdateOnboardingExtensionRequest} req - The request object containing the update details.
 * @param {OnboardingExtensionResponse} res - The response object to send the result of the update.
 * @returns {Promise<OnboardingExtensionResponse>} Sends the response with the result of the update operation.
 */
export const updateOnboardingExtensionRequestStatus = async (req: UpdateOnboardingExtensionRequest, res: OnboardingExtensionResponse): Promise<OnboardingExtensionResponse> => {
    
    const dev = req.query.dev === "true";
    
    if(!dev) return res.boom.notImplemented("Feature not implemented");

    const body = req.body as UpdateOnboardingExtensionRequestBody;
    const lastModifiedBy = req?.userData?.id;
    const extensionId = req.params.id;
    
    let requestBody;

    if(body.reason){
        requestBody = {
            state: body.state,
            type: body.type,
            message: body.reason
        }
    }else{
        requestBody = body;
    }

    try {
        const response = await updateRequest(extensionId, requestBody, lastModifiedBy, REQUEST_TYPE.ONBOARDING);

        if ("error" in response) {
            return res.boom.badRequest(response.error);
        }

        const [logType, returnMessage] = response.state === REQUEST_STATE.APPROVED 
            ? [REQUEST_LOG_TYPE.REQUEST_APPROVED, REQUEST_APPROVED_SUCCESSFULLY]
            : [REQUEST_LOG_TYPE.REQUEST_REJECTED, REQUEST_REJECTED_SUCCESSFULLY];

        const requestLog = {
            type: logType,
            meta: {
                requestId: extensionId,
                action: LOG_ACTION.UPDATE,
                createdBy: lastModifiedBy,
                createdAt: Date.now(),
            },
            body: response,
        };

        await addLog(requestLog.type, requestLog.meta, requestLog.body);
        
        return res.status(200).json({
            message: returnMessage,
            data: {
                id: response.id,
                ...response,
            },
        });
    }catch(error){
        logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
        return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
    }
}