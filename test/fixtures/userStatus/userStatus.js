const userStsDataForNewUser = {
  currentStatus: {
    until: 1669256009000,
    message: "Bad Health",
    state: "OOO",
    updatedAt: 1668215609000,
    from: 1668215609000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};

const userStsDataForOooStateForShortDuration = {
  currentStatus: {
    message: "",
    state: "OOO",
    updatedAt: 1673893800000,
    from: 1673893800000,
    until: 1674066600000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};
const userStsDataForOooState = {
  currentStatus: {
    until: 1669256009000,
    message: "Bad Health",
    state: "OOO",
    updatedAt: 1668215609000,
    from: 1668215609000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};

const validUserStsDataforUpdate = {
  currentStatus: {
    until: "",
    message: "",
    state: "ACTIVE",
    updatedAt: 1668215609000,
    from: 1668215609000,
  },
};

const invalidUserStsDataforUpdate = {
  currentStatus: {
    until: "",
    message: "",
    state: "IN_OFFICE",
    updatedAt: 1668215609000,
    from: 1668215609000,
  },
};

const initialDataForFutureStatus = {
  currentStatus: {
    state: "ACTIVE",
    message: "",
    updatedAt: 1668215609000,
    from: 1668215609000,
    until: "",
  },
};
const finalDataForFutureStatus = {
  currentStatus: {
    state: "OOO",
    message: "Vacation Trip",
    updatedAt: 1668215609000,
    from: 1669228200000,
    until: 1669573800000,
  },
};
const updatedOooDataForFutureStatus = {
  currentStatus: {
    state: "OOO",
    message: "New plan for vacation Trip",
    updatedAt: 1668215609000,
    from: 1669833000000,
    until: 1670178600000,
  },
};

const oooStatusDataFromToday = {
  currentStatus: {
    state: "OOO",
    message: "New plan for vacation Trip",
    updatedAt: 1668191400000,
    from: 1668191400000,
    until: 1668623400000,
  },
};

const activeStatusDataFromToday = {
  currentStatus: {
    state: "ACTIVE",
    message: "",
    updatedAt: 1669401000000,
    from: 1669401000000,
    until: "",
  },
};

module.exports = {
  userStsDataForNewUser,
  userStsDataForOooState,
  userStsDataForOooStateForShortDuration,
  validUserStsDataforUpdate,
  invalidUserStsDataforUpdate,
  initialDataForFutureStatus,
  finalDataForFutureStatus,
  updatedOooDataForFutureStatus,
  oooStatusDataFromToday,
  activeStatusDataFromToday,
};
