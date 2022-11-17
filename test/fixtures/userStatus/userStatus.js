const userStsDataForOooState = (userId) => {
  return {
    userId,
    currentStatus: {
      until: "1669256009000",
      message: "Bad Health",
      state: "OOO",
      updatedAt: "1668215609000",
      from: "1668215609000",
    },
    monthlyHours: {
      updatedAt: "1668215609000",
      committed: "40",
    },
  };
};

const invalidUserStsDataforPost = (userId) => {
  return {
    userId,
    currentStatus: {
      until: "",
      message: "",
      state: "ACTIVE",
      updatedAt: "1668215609000",
      from: "1668215609000",
    },
  };
};

const validUserStsDataforUpdate = {
  currentStatus: {
    until: "",
    message: "",
    state: "ACTIVE",
    updatedAt: "1668215609000",
    from: "1668215609000",
  },
};

const invalidUserStsDataforUpdate = {
  currentStatus: {
    until: "",
    message: "",
    state: "IN_OFFICE",
    updatedAt: "1668215609000",
    from: "1668215609000",
  },
};

module.exports = {
  userStsDataForOooState,
  invalidUserStsDataforPost,
  validUserStsDataforUpdate,
  invalidUserStsDataforUpdate,
};
