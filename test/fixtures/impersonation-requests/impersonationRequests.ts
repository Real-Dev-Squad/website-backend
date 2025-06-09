import { REQUEST_STATE } from "../../../constants/requests";

export const impersonationRequestsBodyData = [
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "superuser-1",
    createdFor: "suvidh-kaushik",
    userId: "userId123",
    reason: "User assistance required for account debugging.",
    impersonatedUserId: "userId345",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "superuser-2",
    createdFor: "suvidh-kaushik-2",
    userId: "userId124",
    reason: "User assistance required for account debugging.",
    impersonatedUserId: "userId445",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "admin222",
    createdFor: "user321",
    userId: "admin222",
    reason: "Investigating bug in user workflow.",
    impersonatedUserId: "user321",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "adminUsername",
    createdFor: "user322",
    userId: "admin2223",
    reason: "Verifying permissions for support case.",
    impersonatedUserId: "user322",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "adminUsername",
    createdFor: "user321",
    userId: "admin222",
    reason: "Testing impersonation feature for QA.",
    impersonatedUserId: "user321",
  },
  {
    status: REQUEST_STATE.APPROVED,
    isImpersonationFinished: false,
    createdBy: "approverUser",
    createdFor: "approvedUser",
    userId: "approverId",
    reason: "Approved for troubleshooting session.",
    impersonatedUserId: "approvedUserId",
  },
  {
    status: REQUEST_STATE.REJECTED,
    isImpersonationFinished: false,
    createdBy: "reviewerUser",
    createdFor: "rejectedUser",
    userId: "reviewerId",
    reason: "Request rejected due to insufficient details.",
    impersonatedUserId: "rejectedUserId",
  }
];

export const updateImpersonationRequestApproved = {
  status: REQUEST_STATE.APPROVED,
};

export const updateImpersonationRequestRejected = {
  status: REQUEST_STATE.REJECTED,
};