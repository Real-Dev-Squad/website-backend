import { Request, Response } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";
import { userState } from "../constants/userStatus";
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
  type: REQUEST_TYPE.OOO;
  requestedBy?: string;
  from: number;
  until: number;
  message: string;
  state: REQUEST_STATE.PENDING;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
export type OooRequestCreateRequest = Request & { OooStatusRequestBody , userData: userData , query: RequestQuery };

export type OooRequestUpdateRequest = Request & { oooRequestUpdateBody , userData: userData , query: RequestQuery , params: RequestParams };

export type AcknowledgeOOORequestQuery = RequestQuery & {
  dev?: string
};

export type AcknowledgeOOORequestBody = {
  type: REQUEST_TYPE.OOO;
  comment?: string;
  status: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
}

export type AcknowledgeOOORequest = Request & {
  body: AcknowledgeOOORequestBody;
  userData: userData;
  query: AcknowledgeOOORequestQuery;
  params: RequestParams;
}
