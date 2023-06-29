const firestore = require("../utils/firestore");
const qrAuthModel = firestore.collection("QrCodeAuth");
const USER_DOES_NOT_EXIST_ERROR = "User does not exist.";
const userModel = firestore.collection("users");

const updateStatus = async (userId, authStatus = "NOT_INIT") => {
  try {
    const authData = await qrAuthModel.doc(userId).get();

    if (!authData.data()) {
      return {
        userExists: false,
      };
    }

    await qrAuthModel.doc(userId).set({
      ...authData.data(),
      authorization_status: authStatus,
    });

    return {
      userExists: true,
      data: {
        ...authData.data(),
        authorization_status: authStatus,
      },
    };
  } catch (err) {
    logger.error("Error in updating auth status", err);
    throw err;
  }
};

const storeUserDeviceInfo = async (userDeviceInfoData) => {
  try {
    const { user_id: userId } = userDeviceInfoData;
    const user = await userModel.doc(userId).get();
    if (user.data()) {
      await qrAuthModel.doc(userId).set(userDeviceInfoData);
      return { userDeviceInfoData };
    } else {
      throw new Error(USER_DOES_NOT_EXIST_ERROR);
    }
  } catch (err) {
    logger.error("Error in storing user device info.", err);
    throw err;
  }
};

module.exports = {
  updateStatus,
  storeUserDeviceInfo,
};
