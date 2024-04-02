import { Request, Response } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "../constants/requests";
import { userState } from "../constants/userStatus";
import { Boom } from "express-boom";

export type OooStatusRequest = {
  id: string;
  type: REQUEST_TYPE.OOO;
  from: number;
  until?: number;
  message?: string;
  status: userState;
  state?: REQUEST_STATE;
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

export type RequestParams = {
  id: string;
};

export type RequestParams = {
  id: string;
};

export type OooRequestResponse = Response & { boom: Boom };
export type OooRequestCreateRequest = Request & { OooStatusRequestBody , userData: userData , query: RequestQuery };

export type OooRequestUpdateRequest = Request & { oooRequestUpdateBody , userData: userData , query: RequestQuery , params: RequestParams };
