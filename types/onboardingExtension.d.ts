import { Request, Response } from "express";
import { Boom } from "express-boom";
import { REQUEST_STATUS, REQUEST_TYPE } from "../constants/requests";
import { RequestQuery } from "./requests";
import { userData } from "./global";

export type OnboardingExtension = {
    id: string;
    type: REQUEST_TYPE.ONBOARDING;
    oldEndsOn: number;
    newEndsOn: number;
    message?: string;
    reason: string;
    requestedBy: string;
    status: REQUEST_STATUS;
    lastModifiedBy?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    requestNumber: number;
    userId: string;
};

export type CreateOnboardingExtensionBody = {
    type: string;
    numberOfDays: number;
    userId: string;
    reason: string;
};

export type OnboardingExtensionRequestQuery = RequestQuery & {
    dev?: string
};

export type OnboardingExtensionResponse = Response & {
    boom: Boom
};

export type OnboardingExtensionCreateRequest = Request & {
    body: CreateOnboardingExtensionBody;
    query: OnboardingExtensionRequestQuery;
};

export type UpdateOnboardingExtensionStateRequestBody = {
    type: REQUEST_TYPE.ONBOARDING;
    message?: string;
    state: REQUEST_STATUS.APPROVED | REQUEST_STATUS.REJECTED;
};

export type RequestParams = {
    id: string;
};

export type UpdateOnboardingExtensionStateRequest = Request & {
    body: UpdateOnboardingExtensionStateRequestBody;
    userData: userData;
    query: OnboardingExtensionRequestQuery;
    params: RequestParams;
};

export type UpdateOnboardingExtensionRequestBody = {
    reason?: string
    newEndsOn: number
    type: REQUEST_TYPE.ONBOARDING
}

export type UpdateOnboardingExtensionRequest = Request & {
    body: UpdateOnboardingExtensionRequestBody;
    userData: userData;
    query: OnboardingExtensionRequestQuery;
    params: RequestParams;
}
