import { REQUEST_STATE } from "../../../constants/requests";

export const impersonationRequestsBodyData = [
  {
   status: REQUEST_STATE.PENDING,
   isImpersonationFinished: false,
   createdBy: "superuser-1",
   createdFor: "suvidh-kaushik",
   userId: "userId123",
   reason: "He asked",
   impersonatedUserId: "userId345",
  },
  {
   status: REQUEST_STATE.PENDING,
   isImpersonationFinished: false,
   createdBy: "superuser-2",
   createdFor: "suvidh-kaushik-2",
   userId: "userId124",
   reason: "He asked again",
   impersonatedUserId: "userId445",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "superuser-2",
    createdFor: "suvidh-kaushik-2",
    userId: "userId124",
    reason: "He asked again",
    impersonatedUserId: "userId445",
  },
  {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "admin222",
    createdFor: "user321",
    userId: "admin222",
    reason: "Investigating bug",
    impersonatedUserId: "user321"
  },
   {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "adminUsername",
    createdFor: "user322",
    userId: "admin2223",
    reason: "Investigating bug",
    impersonatedUserId: "user322"
  },
   {
    status: REQUEST_STATE.PENDING,
    isImpersonationFinished: false,
    createdBy: "adminUsername",
    createdFor: "user321",
    userId: "admin222",
    reason: "Investigating bug",
    impersonatedUserId: "user321"
  }
];

export const updateImpersonationRequestApproved = {
  status: REQUEST_STATE.APPROVED,
};

export const updateImpersonationRequestRejected = {
  status: REQUEST_STATE.REJECTED,
};