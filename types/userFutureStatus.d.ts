import { userState, statusState } from "../constants/userStatus";

export type UserFutureStatusType = {
  id?: string;
  requestId?: string;
  status: userState.OOO | userState.IDLE | userState.ACTIVE;
  state: statusState.PENDING | statusState.APPLIED | statusState.NOT_APPLIED;
  from: number;
  endsOn?: number;
  userId: string;
  message?: string;
  updatedAt?: number;
  createdAt?: number;
};
