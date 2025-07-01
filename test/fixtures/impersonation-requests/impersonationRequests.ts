import { REQUEST_STATE } from "../../../constants/requests";

export const impersonationRequestsBodyData = [
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    userId: "userId123",
    reason: "User assistance required for account debugging.",
    impersonatedUserId: "userId345",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    userId: "userId124",
    reason: "User assistance required for account debugging.",
    impersonatedUserId: "userId445",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    userId: "admin222",
    reason: "Investigating bug in user workflow.",
    impersonatedUserId: "user321",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    userId: "admin2223",
    reason: "Verifying permissions for support case.",
    impersonatedUserId: "user322",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    userId: "admin222",
    reason: "Testing impersonation feature for QA.",
    impersonatedUserId: "user321",
  },
  {
    status: REQUEST_STATE.APPROVED,
    isImpersonationFinished: false,
    userId: "approverId",
    reason: "Approved for troubleshooting session.",
    impersonatedUserId: "approvedUserId",
  },
  {
    status: REQUEST_STATE.REJECTED,
    isImpersonationFinished: false,
    userId: "reviewerId",
    reason: "Request rejected due to insufficient details.",
    impersonatedUserId: "rejectedUserId",
  }
];
