import { Request, Response } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/request";
import { userState } from "../constants/userStatus";
import { Boom } from "express-boom";

export type OooStatusRequest = {
  type: REQUEST_TYPE.OOO;
  from: number;
  until?: number;
  message?: string;
  status: userState;
  state?: REQUEST_STATE;
  lastModifiedBy?: string;
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

export type userData= {
  id: string;
};

export type OooRequestQuery = {
  dev: string;
  type?: string;
  requestedBy?: string;
  state?: REQUEST_STATE.APPROVED | REQUEST_STATE.PENDING | REQUEST_STATE.REJECTED;
  id?: string;
};

export type RequestParams = {
  id: string;
};

export type RequestParams = {
  id: string;
};

export type OooRequestResponse = Response & { boom: Boom };
export type OooRequestCreateRequest = Request & { OooStatusRequestBody , userData: userData , query: OooRequestQuery };

export type OooRequestUpdateRequest = Request & { oooRequestUpdateBody , userData: userData , query: OooRequestQuery , params: RequestParams };
