import { REQUEST_TYPE } from "../../../constants/requests";
import { statusState } from "../../../constants/userStatus";

export const userFutureStatusData = {
  requestId: "randomId",
  status: REQUEST_TYPE.OOO,
  state: statusState.UPCOMING,
  from: 1712277700000,
  endsOn: 1712277700000,
  userId: "randomUserId",
  message: "I am out of office",
};
