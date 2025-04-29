import { Request } from "express";
import { REQUEST_STATUS, REQUEST_TYPE } from "./../constants/requests";
import { userData } from "./global";

export type UpdateRequestBody = {
  type: REQUEST_TYPE.OOO | REQUEST_TYPE.EXTENSION;
  reason: string;
  state: REQUEST_STATUS.APPROVED | REQUEST_STATUS.REJECTED;
};

export type RequestQuery = {
  type?: string;
  requestedBy?: string;
  state?: REQUEST_STATUS.APPROVED | REQUEST_STATUS.PENDING | REQUEST_STATUS.REJECTED;
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
