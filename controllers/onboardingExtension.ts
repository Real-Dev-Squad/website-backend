import {
    ERROR_WHILE_CREATING_REQUEST,
    ERROR_WHILE_UPDATING_REQUEST,
    INVALID_REQUEST_DEADLINE,
    INVALID_REQUEST_TYPE,
    LOG_ACTION,
    ONBOARDING_REQUEST_CREATED_SUCCESSFULLY,
    PENDING_REQUEST_UPDATED,
    REQUEST_ALREADY_PENDING,
    REQUEST_APPROVED_SUCCESSFULLY,
    REQUEST_DOES_NOT_EXIST,
    REQUEST_LOG_TYPE,
    REQUEST_REJECTED_SUCCESSFULLY,
    REQUEST_STATE,
    REQUEST_TYPE,
    REQUEST_UPDATED_SUCCESSFULLY,
    UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST,
    UNAUTHORIZED_TO_UPDATE_REQUEST,
} from "../constants/requests";
import { userState } from "../constants/userStatus";
import { addLog } from "../services/logService";
import { createRequest, getRequestByKeyValues, updateRequest } from "../models/requests";
import { fetchUser } from "../models/users";
import { getUserStatus } from "../models/userStatus";
import { User } from "../typeDefinitions/users";
import { 
    CreateOnboardingExtensionBody, 
    OnboardingExtension, 
    OnboardingExtensionCreateRequest, 
    OnboardingExtensionResponse, 
    UpdateOnboardingExtensionStateRequest,
    UpdateOnboardingExtensionStateRequestBody,
    UpdateOnboardingExtensionRequest,
    UpdateOnboardingExtensionRequestBody
} from "../types/onboardingExtension";
import { convertDateStringToMilliseconds, getNewDeadline } from "../utils/requests";
import { convertDaysToMilliseconds } from "../utils/time";
import firestore from "../utils/firestore";
import { logType } from "../constants/logs";
const requestModel = firestore.collection("requests");

/**
* Controller to handle the creation of onboarding extension requests.
*
* This function processes the request to create an extension for the onboarding period,
* validates the user status, checks existing requests, calculates new deadlines,
* and stores the new request in the database with logging.
*
* @param {OnboardingExtensionCreateRequest} req - The Express request object containing the body with extension details.
* @param {OnboardingExtensionResponse} res - The Express response object used to send back the response.
* @returns {Promise<OnboardingExtensionResponse>} Resolves to a response with the status and data or an error message.
*/
export const createOnboardingExtensionRequestController = async (
    req: OnboardingExtensionCreateRequest, 
    res: OnboardingExtensionResponse )
    : Promise<OnboardingExtensionResponse> => {

    try {

        const data = req.body as CreateOnboardingExtensionBody;
        const {user, userExists} = await fetchUser({discordId: data.userId});
        
        if(!userExists) {
            return res.boom.notFound("User not found");
        }

        const { id: userId, discordJoinedAt, username} = user as User;
        const { data: userStatus } =  await getUserStatus(userId);

        if(!userStatus || userStatus.currentStatus.state != userState.ONBOARDING){
            return res.boom.forbidden(UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST);
        }

        const latestExtensionRequest: OnboardingExtension = await getRequestByKeyValues({
            userId: userId,
            type: REQUEST_TYPE.ONBOARDING
        });

        if(latestExtensionRequest && latestExtensionRequest.state === REQUEST_STATE.PENDING){
            return res.boom.conflict(REQUEST_ALREADY_PENDING);
        }
        
        const millisecondsInThirtyOneDays = convertDaysToMilliseconds(31);
        const numberOfDaysInMillisecond = convertDaysToMilliseconds(data.numberOfDays);
        const { isDate, milliseconds: discordJoinedDateInMillisecond } = convertDateStringToMilliseconds(discordJoinedAt);

        if(!isDate){
            logger.error(ERROR_WHILE_CREATING_REQUEST, "Invalid date");
            return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
        }

        let requestNumber: number;
        let oldEndsOn: number;
        const currentDate = Date.now();

        if(!latestExtensionRequest){
            requestNumber = 1;
            oldEndsOn = discordJoinedDateInMillisecond + millisecondsInThirtyOneDays;
        }else if(latestExtensionRequest.state === REQUEST_STATE.REJECTED) {
            requestNumber = latestExtensionRequest.requestNumber + 1;
            oldEndsOn = latestExtensionRequest.oldEndsOn;
        }else{
            requestNumber = latestExtensionRequest.requestNumber + 1;
            oldEndsOn = latestExtensionRequest.newEndsOn;
        }
        
        const newEndsOn = getNewDeadline(currentDate, oldEndsOn, numberOfDaysInMillisecond);
        
        const onboardingExtension = await createRequest({
            type: REQUEST_TYPE.ONBOARDING,
            state: REQUEST_STATE.PENDING,
            userId: userId,
            requestedBy: username,
            oldEndsOn: oldEndsOn,
            newEndsOn: newEndsOn,
            reason: data.reason,
            requestNumber: requestNumber,
        });

        const onboardingExtensionLog = {
            type: REQUEST_LOG_TYPE.REQUEST_CREATED,
            meta: {
                requestId: onboardingExtension.id,
                action: LOG_ACTION.CREATE,
                userId: userId,
                createdAt: Date.now(),
            },
            body: onboardingExtension,
        };

        await addLog(onboardingExtensionLog.type, onboardingExtensionLog.meta, onboardingExtensionLog.body);

        return res.status(201).json({
            message: ONBOARDING_REQUEST_CREATED_SUCCESSFULLY,  
            data: {
                id: onboardingExtension.id,
                ...onboardingExtension,
            }
        });
    }catch (err) {
        logger.error(ERROR_WHILE_CREATING_REQUEST, err);
        return res.boom.badImplementation(ERROR_WHILE_CREATING_REQUEST);
    }
};

/**
 * Updates the state of an onboarding extension request.
 *
 * @param {UpdateOnboardingExtensionStateRequest} req - The request object containing the update details.
 * @param {OnboardingExtensionResponse} res - The response object to send the result of the update.
 * @returns {Promise<OnboardingExtensionResponse>} Sends the response with the result of the update operation.
 */
export const updateOnboardingExtensionRequestState = async (
    req: UpdateOnboardingExtensionStateRequest, 
    res: OnboardingExtensionResponse )
    : Promise<OnboardingExtensionResponse> => {
    
    const dev = req.query.dev === "true";
    
    if(!dev) return res.boom.notImplemented("Feature not implemented");

    const body = req.body as UpdateOnboardingExtensionStateRequestBody;
    const lastModifiedBy = req?.userData?.id;
    const extensionId = req.params.id;

    let requestBody: UpdateOnboardingExtensionStateRequestBody = {
        state: body.state,
        type: body.type,
    }

    if(body.message){
        requestBody = { ...requestBody, message: body.message };
    }
    
    try {
        const response = await updateRequest(extensionId, requestBody, lastModifiedBy, REQUEST_TYPE.ONBOARDING);

        if ("error" in response) {
            if (response.error === REQUEST_DOES_NOT_EXIST) {
                return res.boom.notFound(response.error);
            }
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

/*
 * Updates an onboarding extension request.
 *
 * @async
 * @function updateOnboardingExtensionRequestController
 * @param {UpdateOnboardingExtensionRequest} req - The request object containing parameters, query, and body.
 * @param {OnboardingExtensionResponse} res - The response object used to send back the HTTP response.
 * @returns {Promise<OnboardingExtensionResponse>} - Returns a promise that resolves to a response indicating success or failure.
 */
export const updateOnboardingExtensionRequestController = async (
    req: UpdateOnboardingExtensionRequest, 
    res: OnboardingExtensionResponse): Promise<OnboardingExtensionResponse> => 
{
    
    const body = req.body as UpdateOnboardingExtensionRequestBody;
    const id = req.params.id;
    const lastModifiedBy = req?.userData?.id;
    const isSuperuser = req?.userData?.roles?.super_user === true;
    const dev = req.query.dev === "true";

    if(!dev) return res.boom.notImplemented("Feature not implemented");

    try{
        const extensionRequestDoc = await requestModel.doc(id).get();

        if(!extensionRequestDoc.exists){
            await addLog(logType.REQUEST_DOES_NOT_EXIST, { id }, { message: REQUEST_DOES_NOT_EXIST });
            return res.boom.notFound(REQUEST_DOES_NOT_EXIST);
        }

        const extensionRequest = extensionRequestDoc.data() as OnboardingExtension;
        
        if(!isSuperuser && lastModifiedBy !== extensionRequest.userId) {
            await addLog(logType.UNAUTHORIZED_TO_UPDATE_REQUEST, 
                { lastModifiedBy, userId: extensionRequest.userId }, 
                { message: UNAUTHORIZED_TO_UPDATE_REQUEST }
            );
            return res.boom.forbidden(UNAUTHORIZED_TO_UPDATE_REQUEST);
        }

        if(extensionRequest.type !== REQUEST_TYPE.ONBOARDING) {
            await addLog(logType.INVALID_REQUEST_TYPE, 
                { type: extensionRequest.type }, 
                { message: INVALID_REQUEST_TYPE }
            );
            return res.boom.badRequest(INVALID_REQUEST_TYPE);
        }
        
        if(extensionRequest.state != REQUEST_STATE.PENDING){
            await addLog(logType.PENDING_REQUEST_CAN_BE_UPDATED,
                { state: extensionRequest.state },
                { message:PENDING_REQUEST_UPDATED }
            );
            return res.boom.badRequest(PENDING_REQUEST_UPDATED);
        }

        if(extensionRequest.oldEndsOn >= body.newEndsOn) {
            await addLog(logType.INVALID_REQUEST_DEADLINE, 
                { oldEndsOn: extensionRequest.oldEndsOn, newEndsOn: body.newEndsOn },
                { message: INVALID_REQUEST_DEADLINE }
            );
            return res.boom.badRequest(INVALID_REQUEST_DEADLINE);
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
                requestId: extensionRequestDoc.id,
                action: LOG_ACTION.UPDATE,
                createdBy: lastModifiedBy,
            },
            body: requestBody,
        };
    
        await addLog(requestLog.type, requestLog.meta, requestLog.body);
        
        return res.status(200).json({
            message: REQUEST_UPDATED_SUCCESSFULLY,
            data: {
            id: extensionRequestDoc.id,
            ...requestBody
            }
        })
    }catch(error){
        logger.error(ERROR_WHILE_UPDATING_REQUEST, error);
        return res.boom.badImplementation(ERROR_WHILE_UPDATING_REQUEST);
    }
}
