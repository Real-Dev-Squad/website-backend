import { Request } from "express";
import { REQUEST_STATE, REQUEST_TYPE } from "./../constants/requests";
import { userData } from "./global";

export type UpdateRequestBody = {
  type: REQUEST_TYPE.OOO | REQUEST_TYPE.EXTENSION;
  reason: string;
  state: REQUEST_STATE.APPROVED | REQUEST_STATE.REJECTED;
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

export type UpdateRequest = Request & {
  UpdateRequestBody;
  userData: userData;
  query: RequestQuery;
  params: RequestParams;
};
