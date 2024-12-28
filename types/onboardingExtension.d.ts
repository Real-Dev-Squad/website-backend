import { userData } from "./global";
import { REQUEST_STATE, REQUEST_TYPE } from "./../constants/requests";
import { Request, Response } from "express";

export type OnboardingExtensionResponse = Response & {
    boom: Boom
}

export type UpdateOnboardingExtensionRequestBody = {
    type: REQUEST_TYPE.ONBOARDING;
    reason?: string;
    state: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
};

export type RequestParams = {
    id: string;
};

export type UpdateOnboardingExtensionRequest = Request & {
    body: UpdateOnboardingExtensionRequestBody;
    userData: userData;
    query: RequestQuery;
    params: RequestParams;
};