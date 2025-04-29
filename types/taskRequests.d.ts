import { REQUEST_STATUS } from "./../constants/requests";
import { Request, Response } from "express";
import { Boom } from "express-boom";
import { REQUEST_STATUS, REQUEST_TYPE } from "../constants/requests";
import { TASK_REQUEST_STATUS, TASK_REQUEST_TYPE } from "../constants/taskRequests";

import { userData } from "./global";
export type TaskCreationRequest = {
    id: string;
    type: REQUEST_TYPE.TASK;
    externalIssueUrl: string;
    externalIssueHtmlUrl: string;
    requestType: TASK_REQUEST_TYPE.CREATION | TASK_REQUEST_TYPE.ASSIGNMENT;
    userId?: string;
    taskId?: string;
    state: REQUEST_STATUS;
    requestedBy?: string;
    proposedStartDate: number;
    proposedDeadline: number;
    description?: string;
    markdownEnabled?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    requesters?: string[];
    lastModifiedBy?: string;
    approvedTo?: string;
};

export type TaskCreationRequestBody = {
    type: REQUEST_TYPE.TASK;
    state: REQUEST_STATUS.PENDING;
    externalIssueUrl: string;
    externalIssueHtmlUrl: string;
    requestType: TASK_REQUEST_TYPE.CREATION;
    requestedBy?: string;
    proposedStartDate: number;
    proposedDeadline: number;
    description?: string;
    markdownEnabled?: boolean;
};

export type TaskCreationRequestUpdateBody = {
    lastModifiedBy?: string;
    type?: REQUEST_TYPE.TASK;
    id?: string;
    state: REQUEST_STATUS.APPROVED | REQUEST_STATUS.REJECTED;
    approvedTo?: string;
};

export type RequestQuery = {
    dev?: string;
    type?: string;
    requestedBy?: string;
    state?: REQUEST_STATUS.APPROVED | REQUEST_STATUS.PENDING | REQUEST_STATUS.REJECTED;
    id?: string;
    prev?: string;
    next?: string;
    page?: number;
    size?: number;
};

export type TaskRequestResponse = Response & { Boom: Boom };
export type TaskRequestRequest = Request & {
    TaskCreationRequestBody: TaskCreationRequestBody;
    userData: userData;
    query: RequestQuery;
    Boom: Boom;
};
