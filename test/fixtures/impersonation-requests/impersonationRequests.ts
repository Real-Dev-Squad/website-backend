import { REQUEST_STATE } from "../../../constants/requests";

export const createImpersonationRequestBody = {
  impersonatedUserId: "user123",
  reason: "Debugging user issue"
};

export const ImpersonationRequest1= {
  status: REQUEST_STATE.PENDING,
  isImpersonationAttempted: false,
  createdBy: "superuser-1",
  createdFor: "suvidh-kaushik",
  userId: "userId123",
  reason: "He asked",
  impersonatedUserId: "userId345"
};

export const ImpersonationRequest2={
  status: REQUEST_STATE.PENDING,
  isImpersonationAttempted: false,
  createdBy: "superuser-2",
  createdFor: "suvidh-kaushik-2",
  userId: "userId124",
  reason: "He asked again",
  impersonatedUserId: "userId445"
}

export const wrongCreateImpersonationRequestModelBody = {
  status: REQUEST_STATE.PENDING,
  isImpersonationAttempted: false,
  createdBy: "testuser3",
  createdFor: "targetUser",
  userId: "admin456",
  reason: "Debugging user issue",
  impersonatedUserId: "",
};

export const impersonationRequest = {
  id: "impReq1",
  status: REQUEST_STATE.PENDING,
  isImpersonationAttempted: false,
  createdBy: "admin456",
  createdFor: "user123",
  userId: "admin456",
  reason: "Debugging user issue",
  impersonatedUserId: "user123",
  createdAt: 1716000000000,
  updatedAt: 1716000000000
};

export const impersonationRequests = [
  {
    id: "impReq1",
    status: REQUEST_STATE.APPROVED,
    isImpersonationAttempted: true,
    createdBy: "admin789",
    createdFor: "user456",
    userId: "admin789",
    reason: "Support session",
    impersonatedUserId: "user456",
    createdAt: 1716100000000,
    updatedAt: 1716100000000,
    startedAt: 1716100001000,
    endedAt: 1716100005000
  },
  {
    id: "impReq2",
    status: REQUEST_STATE.REJECTED,
    isImpersonationAttempted: false,
    createdBy: "admin999",
    createdFor: "user789",
    userId: "admin999",
    reason: "Testing permissions",
    impersonatedUserId: "user789",
    createdAt: 1716200000000,
    updatedAt: 1716200000000
  },
  {
    id: "impReq3",
    status: REQUEST_STATE.PENDING,
    isImpersonationAttempted: false,
    createdBy: "admin222",
    createdFor: "user321",
    userId: "admin222",
    reason: "Investigating bug",
    impersonatedUserId: "user321",
    createdAt: 1716300000000,
    updatedAt: 1716300000000
  },
   {
    id: "impReq4",
    status: REQUEST_STATE.PENDING,
    isImpersonationAttempted: false,
    createdBy: "admin223",
    createdFor: "user322",
    userId: "admin2223",
    reason: "Investigating bug",
    impersonatedUserId: "user322",
    createdAt: 1716300000000,
    updatedAt: 1716300000000
  },
   {
    id: "impReq5",
    status: REQUEST_STATE.PENDING,
    isImpersonationAttempted: false,
    createdBy: "admin222",
    createdFor: "user321",
    userId: "admin222",
    reason: "Investigating bug",
    impersonatedUserId: "user321",
    createdAt: 1716300000000,
    updatedAt: 1716300000000
  }
];

export const updateImpersonationRequestApproved = {
  status: REQUEST_STATE.APPROVED,
};

export const updateImpersonationRequestRejected = {
  status: REQUEST_STATE.REJECTED,
};