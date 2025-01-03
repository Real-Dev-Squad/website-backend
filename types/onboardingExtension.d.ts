import { REQUEST_TYPE } from "./../constants/requests";
import { userData } from "./global";
import { RequestParams, RequestQuery } from "./requests";

export type UpdateOnboardingExtensionRequestBody = {
    reason?: string
    newEndsOn: number
    type: REQUEST_TYPE.ONBOARDING
}

export type UpdateOnboardingExtensionRequest = Request & {
    body: UpdateOnboardingExtensionRequestBody;
    userData: userData;
    query: RequestQuery & {dev: string};
    params: RequestParams;
}