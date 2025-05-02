import { REQUEST_STATUS, REQUEST_TYPE } from "../../../constants/requests";

export const createOooStatusRequests = {
  type: "OOO",
  requestedBy: "user123",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  status: REQUEST_STATUS.PENDING,
  createdAt: 1234567890,
  updatedAt: 1234567890,
};

export const validOooStatusRequests = {
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  status: REQUEST_STATUS.PENDING,
};

export const invalidOooStatusRequests = {
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
};

export const updateOooApprovedRequests = {
  status: REQUEST_STATUS.APPROVED,
  lastModifiedBy: "admin123",
  updatedAt: 1234567890,
  reason: "Approval granted.",
};

export const updateOooRejectedRequests = {
  status: REQUEST_STATUS.REJECTED,
  lastModifiedBy: "admin123",
  updatedAt: 1234567890,
  reason: "Sorry, we can't approve additional leave at this time.",
};

export const validOooStatusUpdate ={
  status: REQUEST_STATUS.APPROVED,
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
  status: REQUEST_STATUS.PENDING,
};
export const createOooRequests2 = {
  requestedBy: "testUser2",
  type: "OOO",
  from: Date.now() + 100000,
  until: Date.now() + 200000,
  message: "Out of office for personal reasons.",
  status: REQUEST_STATUS.PENDING,
};


export const oooStatusRequests = [
  {
    id: "MpykhM8sT1Tlid4Y6Y0d",
    requestedBy: "user456",
    status: REQUEST_STATUS.APPROVED,
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
    status: REQUEST_STATUS.REJECTED,
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
    status: REQUEST_STATUS.PENDING,
    from: 1710000000000,
    until: 1711000000000,
    message: "Family vacation.",
    createdAt: 1709999999999,
    updatedAt: 1710000000000,
  },

  {
    id: "def456",
    requestedBy: "user202",
    status: REQUEST_STATUS.APPROVED,
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
    status: REQUEST_STATUS.APPROVED,
    lastModifiedBy: "admin123",
    updatedAt: 1234567890,
    reason: "Approval granted.",
  },
];
