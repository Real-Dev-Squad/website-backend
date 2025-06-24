import { Request, Response } from "express";
import { REQUEST_STATE } from "../constants/requests";
import { Boom } from "express-boom";
import {RequestQuery } from "./requests";
import { userData } from "./global";
import { Timestamp } from "firebase-admin/firestore";

export type ImpersonationRequest = {
    id: string;
    status: REQUEST_STATE;
    isImpersonationFinished: boolean;
    createdBy: string;
    createdFor: string;
    userId: string;
    reason: string;
    message?: string;
    impersonatedUserId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    startedAt?: Timestamp;
    endedAt?: Timestamp;
}

export type CreateImpersonationRequestBody = {
   impersonatedUserId: string;
   reason: string;
};

export type CreateImpersonationRequestModelDto = {
    status: REQUEST_STATE;
    isImpersonationFinished: boolean;
    createdBy: string;
    createdFor: string;
    userId: string;
    reason: string;
    impersonatedUserId: string;
}

export type UpdateImpersonationRequestDataBody = {
    startedAt?: Timestamp;
    endedAt: Timestamp;
    isImpersonationFinished?: boolean;
}

export type UpdateImpersonationRequestStatusBody = {
    status: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
    message?: string;
}

export type ImpersonationRequestQuery = RequestQuery & {
    dev?: string;
    createdBy?: string;
    createdFor?: string;
    status?: keyof typeof REQUEST_STATE;
    id?: string;
    prev?: string;
    next?: string;
    size?: number;
};

export type ImpersonationRequestResponse = Response & {
    boom: Boom;
};

export type RequestParams = {
    id: string;
}

export type CreateImpersonationRequest = Request & {
   userData: userData;
   body: CreateImpersonationRequestBody;
   query: ImpersonationRequestQuery;
};

export type UpdateImpersonationRequestStatus = Request & {
    userData: userData;
    body: UpdateImpersonationRequestStatusBody;
    query: ImpersonationRequestQuery;
    params: RequestParams;
}

export type PaginatedImpersonationRequests = {
    allRequests: ImpersonationRequest[];
    next: string;
    prev: string;
    count: number;
}

export type CreateImpersonationRequestServiceBody={
   userId: string;
   createdBy: string;
   impersonatedUserId: string;
   reason: string;
}

export type GetImpersonationControllerRequest = Request & {
    query: ImpersonationRequestQuery
}