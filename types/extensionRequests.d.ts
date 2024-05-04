import { Request, Response } from "express";
import { Boom } from "express-boom";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";

export type ExtensionRequest = {
    id: string;
    type: REQUEST_TYPE.EXTENSION;
    taskId: string;
    title: string;
    oldEndsOn: number;
    newEndsOn: number;
    message?: string;
    requestedBy?: string;
    state?: REQUEST_STATE;
    lastModifiedBy?: string;
    reason?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    requestNumber?: number;
};

export type ExtensionRequestCreateBody = {
    type: REQUEST_TYPE.EXTENSION;
    taskId: string;
    title: string;
    message?: string;
    requestedBy?: string;
    oldEndsOn: number;
    newEndsOn: number;
    state: REQUEST_STATE.PENDING;
    requestNumber?: number;
    assignee?: string;
};

export type ExtensionRequestUpdateBody = {
    lastModifiedBy?: string;
    type?: REQUEST_TYPE.EXTENSION;
    id?: string;
    reason?: string;
    state: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
};

export type userData = {
    id: string;
};

export type RequestQuery = {
    dev?: string;
    type?: string;
    requestedBy?: string;
    state?: REQUEST_STATE.APPROVED | REQUEST_STATE.PENDING | REQUEST_STATE.REJECTED;
    id?: string;
    prev?: string;
    next?: string;
    page?: number;
    size?: number;
};

export type ExtensionRequestResponse = Response & { Boom: Boom };
export type ExtensionRequestRequest = Request & {
    ExtensionRequestCreateBody: ExtensionRequestCreateBody;
    userData: userData;
    query: RequestQuery;
    Boom: Boom;
};
