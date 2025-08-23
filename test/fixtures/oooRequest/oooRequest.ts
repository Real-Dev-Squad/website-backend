import { REQUEST_STATE, REQUEST_TYPE } from "../../../constants/requests";
import { UserStatus } from "../../../types/userStatus";

export const createOooStatusRequests = {
  type: "OOO",
  requestedBy: "user123",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  state: REQUEST_STATE.PENDING,
  createdAt: 1234567890,
  updatedAt: 1234567890,
};

export const validOooStatusRequests = {
  type: "OOO",
  from: Date.now() + 1 * 24 * 60 * 60 * 1000,
  until: Date.now() + 5 * 24 * 60 * 60 * 1000,
  reason: "Out of office for personal reasons."
};

export const createdOOORequest = {
  id: "Js7JnT6uRBLjGvSJM5X5",
  type: validOooStatusRequests.type,
  from: validOooStatusRequests.from,
  until: validOooStatusRequests.until,
  reason: validOooStatusRequests.reason,
  status: "PENDING",
  lastModifiedBy: null,
  requestedBy: "jCqqOYCnm93mcmaYuSsQ",
  comment: null
};

export const validUserCurrentStatus = {
  from: Date.now(),
  until: Date.now() + 1 * 24 * 60 * 60 * 1000,
  message: "",
  state: "ACTIVE",
  updatedAt: Date.now(),
};

export const testUserStatus: UserStatus = {
  id: "wcl0ZLsnngKUNZY9GkCo",
  data: {
      currentStatus: validUserCurrentStatus
  },
  userStatusExists: true
};

export const invalidOooStatusRequests = {
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
};

export const updateOooApprovedRequests = {
  state: REQUEST_STATE.APPROVED,
  lastModifiedBy: "admin123",
  updatedAt: 1234567890,
  reason: "Approval granted.",
};

export const updateOooRejectedRequests = {
  state: REQUEST_STATE.REJECTED,
  lastModifiedBy: "admin123",
  updatedAt: 1234567890,
  reason: "Sorry, we can't approve additional leave at this time.",
};

export const validOooStatusUpdate ={
  state: REQUEST_STATE.APPROVED,
  reason: "Welcome back! Enjoy the conference.",
  type:REQUEST_TYPE.OOO
}

export const invalidOooStatusUpdate ={
  reason: "Welcome back! Enjoy the conference.",
  type:REQUEST_TYPE.OOO
}


export const createOooRequests = {
  requestedBy: "testUser",
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  state: REQUEST_STATE.PENDING,
};
export const createOooRequests2 = {
  requestedBy: "testUser2",
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  state: REQUEST_STATE.PENDING,
};


export const oooStatusRequests = [
  {
    id: "MpykhM8sT1Tlid4Y6Y0d",
    requestedBy: "user456",
    state: REQUEST_STATE.APPROVED,
    from: 1709525300000,
    until: 1709870800000,
    message: "Attending a work conference.",
    createdAt: 1709525400000,
    updatedAt: 1709827800000,
    lastModifiedBy: "adminUser",
    reason: "Welcome back! Enjoy the conference.",
  },
  {
    id: "Me8sT1Tlid4Y6Y0d",
    requestedBy: "user789",
    state: REQUEST_STATE.REJECTED,
    from: 1709603700000,
    until: 1709785600000,
    message: "Out of office for personal reasons.",
    createdAt: 1708763200000,
    updatedAt: 1708841500000,
    lastModifiedBy: "adminUser",
    reason: "Sorry, we can't approve additional leave at this time.",
  },

  {
    id: "abc123",
    requestedBy: "user101",
    state: REQUEST_STATE.PENDING,
    from: 1710000000000,
    until: 1711000000000,
    message: "Family vacation.",
    createdAt: 1709999999999,
    updatedAt: 1710000000000,
  },

  {
    id: "def456",
    requestedBy: "user202",
    state: REQUEST_STATE.APPROVED,
    from: 1712000000000,
    until: 1713000000000,
    message: "Remote work due to personal reasons.",
    createdAt: 1711999999999,
    updatedAt: 1712000000000,
    lastModifiedBy: "adminUser",
    reason: "Understood. Make sure to stay connected during remote work.",
  },
];

export const updateOooStatusRequest = [
  {
    state: REQUEST_STATE.APPROVED,
    lastModifiedBy: "admin123",
    updatedAt: 1234567890,
    reason: "Approval granted.",
  },
];

export const createOooRequests3 = {
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  type: "OOO",
  requestedBy: "suraj-maity-1",
  reason: "Out of office for personal emergency.",
  status: REQUEST_STATE.PENDING
};

export const testAcknowledgeOooRequest = {
  type: REQUEST_TYPE.OOO,
  status: REQUEST_STATE.APPROVED,
  comment: "OOO request approved as it's emergency."
};