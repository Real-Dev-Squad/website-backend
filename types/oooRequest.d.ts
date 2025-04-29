import { Request, Response } from "express";
import { REQUEST_STATUS, REQUEST_TYPE } from "../constants/requests";
import { userState } from "../constants/userStatus";
import { Boom } from "express-boom";
import { RequestParams, RequestQuery } from "./requests";
import { userData } from "./global";

export type OooStatusRequest = {
  id: string;
  type: REQUEST_TYPE.OOO;
  from: number;
  until?: number;
  message?: string;
  status: userState;
  status?: REQUEST_STATUS;
  lastModifiedBy?: string;
  requestedBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  reason?: string;
};
export type OooStatusRequestBody = {
  type: REQUEST_TYPE.OOO;
  requestedBy?: string;
  from: number;
  until: number;
  message: string;
  status: REQUEST_STATUS.PENDING;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type OooRequestUpdateBody = {
  lastModifiedBy?: string;
  type?: REQUEST_TYPE.OOO;
  id?: string;
  reason?: string;
  status: REQUEST_STATUS.APPROVED | REQUEST_STATUS.REJECTED;
  updatedAt?: admin.firestore.Timestamp;
};

export type OooRequestResponse = Response & { boom: Boom };
export type OooRequestCreateRequest = Request & { OooStatusRequestBody: OooStatusRequestBody, userData: userData, query: RequestQuery };

export type OooRequestUpdateRequest = Request & { oooRequestUpdateBody: OooRequestUpdateBody, userData: userData, query: RequestQuery, params: RequestParams };
