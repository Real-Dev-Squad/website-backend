export const generateNewStatus = (isActive: boolean) => {
  const currentTimeStamp = new Date().getTime();

  const newStatusData = {
      message: "",
      appliedOn: currentTimeStamp,
      status: "IDLE",
      state: "CURRENT"
  };

  if (isActive) {
    newStatusData.status = "ACTIVE";
  }
  return newStatusData;
};

export const getUserIdBasedOnRoute = (req) => {
  let userId;
  if (req.route.path === "/self") {
    userId = req.userData.id;
  } else {
    userId = req.params.userId;
  }
  return userId;
};