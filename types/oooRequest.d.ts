import { Request, Response } from "express";
import { REQUEST_STATE } from "../constants/request";
import { userState } from "../constants/userStatus";
import { Boom } from "express-boom";

export type OooStatusRequest = {
  type: string;
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
  type: string;
  requestedBy?: string;
  from: number;
  until: number;
  message: string;
  state: REQUEST_STATE.PENDING;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type userData= {
  id: string;
};

export type OooRequestQuery = {
  dev: string;
};

export type OooRequestResponse = Response & { boom: Boom };
export type OooRequestCreateRequest = Request & { OooStatusRequestBody , userData: userData , query: OooRequestQuery };
