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

const oooUserStsDataForShortDuration = {
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

module.exports = {
  userStsDataForNewUser,
  userStsDataForOooState,
  oooUserStsDataForShortDuration,
  validUserStsDataforUpdate,
  invalidUserStsDataforUpdate,
};
