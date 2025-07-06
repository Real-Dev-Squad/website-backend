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
    reason: string;
    message?: string;
    createdFor: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    startedAt?: Timestamp;
    endedAt?: Timestamp;
}

export type CreateImpersonationRequestBody = {
   createdFor: string;
   reason: string;
};

export type CreateImpersonationRequestModelDto = {
    status: REQUEST_STATE;
    isImpersonationFinished: boolean;
    createdBy: string;
    reason: string;
    createdFor: string;
}

export type UpdateImpersonationRequestDataBody = {
    startedAt?: Timestamp;
    endedAt: Timestamp;
    isImpersonationFinished?: boolean;
}

export type UpdateImpersonationRequestDataResponse = {
    id:string;
    lastModifiedBy:string;
    startedAt?: Timestamp;
    endedAt: Timestamp;
    isImpersonationFinished?: boolean;
}

export type UpdateImpersonationRequestStatusBody = {
    status: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
    message?: string;
}


export type UpdateImpersonationRequestModelDto = {
    id: string;
    updatePayload: UpdateImpersonationRequestDataBody | UpdateImpersonationRequestStatusBody;
    lastModifiedBy: string;
}

export type UpdateImpersonationStatusModelResponse = {
    status: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
    message?: string;
    id: string;
    lastModifiedBy: string;
}

export type ImpersonationRequestQuery = RequestQuery & {
    dev?: string;
    createdBy?: string;
    createdFor?: string;
    status?: keyof typeof REQUEST_STATE;
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

export type UpdateImpersonationRequest = Request & {
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

export type GetImpersonationRequestByIdRequest = Request & {
    dev:string;
    params: RequestParams;
}

export type GetImpersonationControllerRequest = Request & {
    query: ImpersonationRequestQuery
}

export type CreateImpersonationRequestServiceBody={
   createdBy: string;
   createdFor: string;
   reason: string;
}

export type ImpersonationSessionQuery = RequestQuery & {
  dev?:string;
  action:"START" | "STOP";
}

export type ImpersonationSessionRequest = Request & {
    userData: userData;
    query: ImpersonationSessionQuery;
    params: RequestParams;
    isImpersonating: boolean;
}

export type ImpersonationSessionServiceBody = {
    requestId: string;
    userId: string;
}