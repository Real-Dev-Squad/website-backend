import { userData } from "./global";
import { REQUEST_STATE, REQUEST_TYPE } from "./../constants/requests";
import { Request, Response } from "express";
import { RequestQuery } from "./requests";

export type OnboardingExtensionResponse = Response & {
    boom: Boom
}

export type UpdateOnboardingExtensionStateRequestBody = {
    type: REQUEST_TYPE.ONBOARDING;
    message?: string;
    state: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
};

export type RequestParams = {
    id: string;
};

export type UpdateOnboardingExtensionStateRequest = Request & {
    body: UpdateOnboardingExtensionStateRequestBody;
    userData: userData;
    query: RequestQuery & { dev?: string };
    params: RequestParams;
};