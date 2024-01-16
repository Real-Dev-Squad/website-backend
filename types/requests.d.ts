import { REQUEST_STATE } from "../constants/request";

export type RequestType = {
  requestId: string;
  typeId: string;
  type: string;
  state: REQUEST_STATE;
  requestedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastUpdatedBy?: string;
  reason?: string;
};

export type AddRequestBody = {
  typeId: string;
  type: string;
  state: REQUEST_STATE;
  requestedBy: string;
};

export type UpdateRequestBody = {
  requestId: string;
  lastUpdatedBy: string;
  reason: string;
};

export type GetRequestsParams = {
  next?: string;
  prev?: string;
  page?: number = 1;
  size?: number = 5;
  type?: string;
  state?: string;
  requestedBy?: string;
};
