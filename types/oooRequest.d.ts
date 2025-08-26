import { Request, Response } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";
import { Boom } from "express-boom";
import { RequestParams, RequestQuery } from "./requests";
import { userData } from "./global";

export type OooStatusRequest = {
  id: string;
  type: REQUEST_TYPE.OOO;
  from: number;
  until: number;
  reason: string;
  status: REQUEST_STATE;
  lastModifiedBy: string | null;
  requestedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  comment: string | null;
};

export type oldOooStatusRequest = {
  id: string;
  type: REQUEST_TYPE.OOO;
  from: number;
  until: number;
  message: string;
  state: REQUEST_STATE;
  lastModifiedBy: string | null;
  requestedBy: string;
  reason: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export type OooStatusRequestBody = {
  from: number;
  until: number;
  type: REQUEST_TYPE.OOO;
  reason: string;
};

export type OooRequestUpdateBody = {
  lastModifiedBy?: string;
  type?: REQUEST_TYPE.OOO;
  id?: string;
  reason?: string;
  state: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
  updatedAt?: admin.firestore.Timestamp;
};

export type OooRequestResponse = Response & { boom: Boom };
export type OooRequestCreateRequest = Request & {
  body: OooStatusRequestBody;
  userData: userData;
  query: RequestQuery;
};

export type OooRequestUpdateRequest = Request & { oooRequestUpdateBody , userData: userData , query: RequestQuery , params: RequestParams };

export type AcknowledgeOooRequestQuery = RequestQuery & {
  dev?: string
};

export type AcknowledgeOooRequestBody = {
  type: REQUEST_TYPE.OOO;
  comment?: string;
  status: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
}

export type AcknowledgeOooRequest = Request & {
  body: AcknowledgeOooRequestBody;
  userData: userData;
  query: AcknowledgeOooRequestQuery;
  params: RequestParams;
}