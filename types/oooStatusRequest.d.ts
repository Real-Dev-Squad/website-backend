import { Request, Response } from "express";
import { REQUEST_STATE } from "../constants/request";
import { userState } from "../constants/userStatus";
import { Boom } from "express-boom";

export type OooStatusRequest = {
  userId: string;
  from: number;
  until?: number;
  message?: string;
  status: userState;
  state?: REQUEST_STATE;
  lastUpdatedBy?: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  reason?: string;
};
export type OooStatusRequestBody = {
  userId: string;
  from: number;
  until: number;
  message: string;
  state: REQUEST_STATE.PENDING;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
};

type UserData = {
  id: string;
};
export type OooStatusRequestResponse = Response & { boom: Boom };
export type OooStatusRequestRequest = Request & { OooStatusRequestBody , userData: UserData };
