import { Request, Response } from "express";
import { REQUEST_STATUS } from "../constants/impersonationRequests";
import { Boom } from "express-boom";
import {RequestQuery } from "./requests";
import { userData } from "./global";


export type ImpersonationRequest={
    id: string;
    status: REQUEST_STATUS;
    isImpersonationAttempted:boolean;
    requestedBy: string;
    requestedFor:string;
    userId: string;
    reason: string;
    message?:string;
    impersonatedUserId:string;
    createdAt:Timestamp;
    updatedAt:Timestamp;
    startedAt?:Timestamp;
    endedAt?:TimeStamp;
}

export type CreateImpersonationRequestBody={
   impersonatedUserId:string;
   reason:string;
};

export type CreateImpersonationRequestModelBody={
    status: REQUEST_STATUS;
    isImpersonationAttempted:boolean;
    requestedBy: string;
    requestedFor: string;
    userId: string;
    reason: string;
    impersonatedUserId:string;
}

export type UpdateImpersonationRequestDataBody={
    startedAt?:Timestamp;
    endedAt?:Timestamp;
    isImpersonationAttempted?:boolean;
}

export type UpdateImpersonationRequestStatusBody={
    status:REQUEST_STATUS.APPROVED | REQUEST_STATUS.REJECTED;
    message?:string;
}

export type ImpersonationRequestQuery = RequestQuery & {
    dev?: string
};

export type ImpersonationRequestResponse=Response & {
    boom : Boom
};


export type RequestParams={
    id:string;
}


export type CreateImpersonationRequest=Request & {
   userData: userData;
   body:CreateImpersonationRequestBody;
   query:ImpersonationRequestQuery
};

export type UpdateImpersonationRequestStatus=Request&{
    userData:userData;
    body:UpdateImpersonationRequestStatusBody;
    query:ImpersonationRequestQuery;
    params:RequestParams;
}

export type PaginatedImpersonationRequests={
    allRequests:ImpersonationRequest[];
    next:string;
    prev:string;
    page:number;
    count:number;
}