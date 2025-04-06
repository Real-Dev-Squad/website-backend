import { logType } from "../constants/logs";
import { 
    INVALID_REQUEST_DEADLINE, 
    INVALID_REQUEST_TYPE, 
    LOG_ACTION, 
    PENDING_REQUEST_UPDATED, 
    REQUEST_DOES_NOT_EXIST,
    REQUEST_LOG_TYPE,
    REQUEST_STATE, 
    REQUEST_TYPE, 
    UNAUTHORIZED_TO_UPDATE_REQUEST 
} from "../constants/requests";
import { OnboardingExtension, UpdateOnboardingExtensionRequestBody } from "../types/onboardingExtension";
import { addLog } from "./logService";
import firestore from "../utils/firestore";
import logger from "../utils/logger.js";
const requestModel = firestore.collection("requests");

/**
 * Validates the onboarding extension update request.
 * 
 * @param {object} extensionRequestDoc - The extension request document.
 * @param {string} id - Unique identifier for the request.
 * @param {boolean} isSuperuser - Whether the user has superuser privileges.
 * @param {string} lastModifiedBy - ID of the user modifying the request.
 * @param {number} newEndsOn - Proposed new end date.
 * @returns {Promise<object>} Error details if validation fails.
 */
export const validateOnboardingExtensionUpdateRequest = async (
    extensionRequestDoc, 
    id: string, 
    isSuperuser: boolean, 
    lastModifiedBy: string, 
    newEndsOn: number
) => {
    try{

        if(!extensionRequestDoc.exists){
            await addLog(logType.REQUEST_DOES_NOT_EXIST, { id }, { message: REQUEST_DOES_NOT_EXIST });
            return {
                error: REQUEST_DOES_NOT_EXIST,
            }
        }

        const extensionRequest = extensionRequestDoc.data() as OnboardingExtension;
        
        if(!isSuperuser && lastModifiedBy !== extensionRequest.userId) {
            await addLog(logType.UNAUTHORIZED_TO_UPDATE_REQUEST, 
                { lastModifiedBy, userId: extensionRequest.userId }, 
                { message: UNAUTHORIZED_TO_UPDATE_REQUEST }
            );
            return {
                error: UNAUTHORIZED_TO_UPDATE_REQUEST
            };
        }

        if(extensionRequest.type !== REQUEST_TYPE.ONBOARDING) {
            await addLog(logType.INVALID_REQUEST_TYPE, 
                { type: extensionRequest.type }, 
                { message: INVALID_REQUEST_TYPE }
            );
            return {
                error: INVALID_REQUEST_TYPE
            };
        }
        
        if(extensionRequest.state !== REQUEST_STATE.PENDING){
            await addLog(logType.PENDING_REQUEST_CAN_BE_UPDATED,
                { state: extensionRequest.state },
                { message:PENDING_REQUEST_UPDATED }
            );
            return {
                error: PENDING_REQUEST_UPDATED
            };
        }

        if(extensionRequest.oldEndsOn >= newEndsOn) {
            await addLog(logType.INVALID_REQUEST_DEADLINE, 
                { oldEndsOn: extensionRequest.oldEndsOn, newEndsOn: newEndsOn },
                { message: INVALID_REQUEST_DEADLINE }
            );
            return {
                error: INVALID_REQUEST_DEADLINE
            };
        }
    }catch(error){
        logger.error("Error while validating onboarding extension update request", error);
        throw error;
    }
}

/**
 * Updates an onboarding extension request.
 * 
 * @param {string} id - The extension request document.
 * @param {UpdateOnboardingExtensionRequestBody} body - New request details.
 * @param {string} lastModifiedBy - ID of the user updating the request.
 * @returns {Promise<object>} Updated request body.
 */
export const updateOnboardingExtensionRequest = async (
    id: string, 
    body: UpdateOnboardingExtensionRequestBody, 
    lastModifiedBy: string
) => {
    try{
        const requestBody = {
            ...body, 
            lastModifiedBy,
            updatedAt: Date.now(),
        }
        
        await requestModel.doc(id).update(requestBody);
    
        const requestLog = {
            type: REQUEST_LOG_TYPE.REQUEST_UPDATED,
            meta: {
                requestId: id,
                action: LOG_ACTION.UPDATE,
                createdBy: lastModifiedBy,
            },
            body: requestBody,
        };
        
        await addLog(requestLog.type, requestLog.meta, requestLog.body);
        
        return requestBody;
    }catch(error){
        logger.error("Error while updating onboarding extension request", error);
        throw error;
    }
}