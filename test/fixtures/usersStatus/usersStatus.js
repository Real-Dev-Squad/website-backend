const userStatusDataForNewUser = {
  appliedOn: 1669256009000,
  status: "IDLE",
  state: "CURRENT",
  message: "",
};

const generateUserStatusData = (status, appliedOn, endsOn = "", message = "") => {
  return {
    status,
    message,
    appliedOn,
    endsOn,
  };
};

const userStatusDataForOooState = {
  status: "OOO",
  message: "Bad Health",
  appliedOn: 1668211200000,
  endsOn: 1668709800000,
};

const oooStatusDataForShortDuration = {
  message: "",
  status: "OOO",
  appliedOn: 1673893800000,
  endsOn: 1674066600000,
};

module.exports = {
  userStatusDataForNewUser,
  generateUserStatusData,
  userStatusDataForOooState,
  oooStatusDataForShortDuration,
};
