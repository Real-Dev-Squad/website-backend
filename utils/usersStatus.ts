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
