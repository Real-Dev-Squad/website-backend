import {
  ERROR_WHILE_CREATING_REQUEST,
  LOG_ACTION,
  ONBOARDING_REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_ALREADY_PENDING,
  REQUEST_LOG_TYPE,
  REQUEST_STATE,
  REQUEST_TYPE,
  UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST,
} from "../constants/requests";
import { userState } from "../constants/userStatus";
import { addLog } from "../models/logs";
import { createRequest, getRequestByKeyValues } from "../models/requests";
import { fetchUser } from "../models/users";
import { getUserStatus } from "../models/userStatus";
import { User } from "../typeDefinitions/users";
import { OnboardingExtension, OnboardingExtensionCreateRequest, OnboardingExtensionResponse } from "../types/onboardingExtension";

export const createOnboardingExtensionRequestController = async (req: OnboardingExtensionCreateRequest, res: OnboardingExtensionResponse) => {
  try {

    const data = req.body;
    const {user, userExists} = await fetchUser({discordId: data.userId});
    
    if(!userExists) {
      return res.boom.notFound("User not found");
    }

    const { id: userId, discordJoinedAt, username} = user as User;
    const { data: userStatus } =  await getUserStatus(userId);

    if(!userStatus || userStatus.currentStatus.state != userState.ONBOARDING){
      return res.boom.unauthorized(UNAUTHORIZED_TO_CREATE_ONBOARDING_EXTENSION_REQUEST);
    }

    const latestExtensionRequest: OnboardingExtension = await getRequestByKeyValues({
        userId: userId,
        type: REQUEST_TYPE.ONBOARDING
    });

    if(latestExtensionRequest && latestExtensionRequest.state === REQUEST_STATE.PENDING){
      return res.boom.badRequest(REQUEST_ALREADY_PENDING);
    }
    
    const thirtyOneDaysInMillisecond = 31*24*60*60*1000;
    const discordJoinedDateInMillisecond = new Date(discordJoinedAt).getTime();
    const numberOfDaysInMillisecond = Math.floor(data.numberOfDays)*24*60*60*1000;

    let requestNumber: number;
    let oldEndsOn: number;
    let newEndsOn: number;

    if(!latestExtensionRequest){
      requestNumber = 1;
      oldEndsOn = discordJoinedDateInMillisecond + thirtyOneDaysInMillisecond;
    }else if(latestExtensionRequest.state === REQUEST_STATE.REJECTED) {
      requestNumber = latestExtensionRequest.requestNumber + 1;
      oldEndsOn = latestExtensionRequest.oldEndsOn;
    }else{
      requestNumber = latestExtensionRequest.requestNumber + 1;
      oldEndsOn = latestExtensionRequest.newEndsOn;
    }
    
    newEndsOn = oldEndsOn + numberOfDaysInMillisecond;

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