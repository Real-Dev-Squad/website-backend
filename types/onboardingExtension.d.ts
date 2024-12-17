import { Request, Response } from "express";
import { Boom } from "express-boom";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";
import { userData } from "./global";
import { RequestQuery } from "./requests";

export type OnboardingExtension = {
    id: string;
    type: REQUEST_TYPE.ONBOARDING;
    oldEndsOn: number;
    newEndsOn: number;
    message?: string;
    reason: string;
    requestedBy: string;
    state: REQUEST_STATE;
    lastModifiedBy?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    requestNumber: number;
    userId: string;
}

export type CreateOnboardingExtensionBody = {
    type: string;
    numberOfDays: number;
    requestedBy: string;
    username: string;
    reason: string;
}

export type OnboardingExtensionRequestQuery = RequestQuery & {
    dev?: string
}

export type OnboardingExtensionResponse = Response & {
    Boom: Boom
}
export type OnboardingExtensionCreateRequest = Request & {
    CreateOnboardingExtension: CreateOnboardingExtensionBody;
    query: OnboardingExtensionRequestQuery;
    Boom: Boom;
}