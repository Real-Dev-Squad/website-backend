import { REQUEST_STATE } from "../../../constants/requests";

export const impersonationRequestsBodyData = [
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "userId123",
    reason: "User assistance required for account debugging.",
    createdFor: "userId345",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "userId124",
    reason: "User assistance required for account debugging.",
    createdFor: "userId445",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "admin222",
    reason: "Investigating bug in user workflow.",
    createdFor: "user321",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "admin2223",
    reason: "Verifying permissions for support case.",
    createdFor: "user322",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "admin222",
    reason: "Testing impersonation feature for QA.",
    createdFor: "user321",
  },
  {
    status: REQUEST_STATE.APPROVED,
    isImpersonationFinished: false,
    createdBy: "approverId",
    reason: "Approved for troubleshooting session.",
    createdFor: "approvedUserId",
  },
  {
    status: REQUEST_STATE.REJECTED,
    isImpersonationFinished: false,
    createdBy: "reviewerId",
    reason: "Request rejected due to insufficient details.",
    createdFor: "rejectedUserId",
  }
];
