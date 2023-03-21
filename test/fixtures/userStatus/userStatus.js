const { userState } = require("../../../constants/userStatus");

const userStatusDataForNewUser = {
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

const oooStatusDataForShortDuration = {
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
const userStatusDataForOooState = {
  currentStatus: {
    state: "OOO",
    message: "Bad Health",
    updatedAt: 1668211200000,
    from: 1668211200000,
    until: 1668709800000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};

const idleStatus = {
  currentStatus: {
    message: "",
    state: userState.IDLE,
    updatedAt: 1673893800000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};
const activeStatus = {
  currentStatus: {
    message: "",
    state: userState.ACTIVE,
    updatedAt: 1673893800000,
  },
  monthlyHours: {
    updatedAt: 1668215609000,
    committed: 40,
  },
};

const generateUserStatusData = (state, updatedAt, from, until = "", message = "") => {
  return {
    currentStatus: {
      state,
      message,
      from,
      until,
      updatedAt,
    },
  };
};

module.exports = {
  userStatusDataForNewUser,
  userStatusDataForOooState,
  oooStatusDataForShortDuration,
  generateUserStatusData,
  idleStatus,
  activeStatus,
};
