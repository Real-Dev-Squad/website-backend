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
  lastModifiedBy?: string | null;
  requestedBy: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  comment?: string | null;
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
