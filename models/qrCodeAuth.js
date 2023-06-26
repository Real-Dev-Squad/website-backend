const firestore = require("../utils/firestore");
const QrCodeAuthModel = firestore.collection("QrCodeAuth");
const userModel = firestore.collection("users");
const USER_DOES_NOT_EXIST_ERROR = "User does not exist.";
/**
 * Stores the user device info
 *
 * @param userDeviceInfoData { Object }: User device info data object to be stored in DB
 * @return {Promise<{userDeviceInfoData|Object}>}
 */
const storeUserDeviceInfo = async (userDeviceInfoData) => {
  try {
    const { user_id: userId } = userDeviceInfoData;
    const user = await userModel.doc(userId).get();
    if (user.data()) {
      await QrCodeAuthModel.doc(userId).set(userDeviceInfoData);

      return { userDeviceInfoData };
    } else {
      throw new Error(USER_DOES_NOT_EXIST_ERROR);
    }
  } catch (err) {
    logger.error("Error in storing user device info.", err);
    throw err;
  }
};

const getUserAuthStatus = async (userId) => {
  try {
    const userAuthStatus = await QrCodeAuthModel.where("user_id", "==", userId).get();
    return userAuthStatus;
  } catch (err) {
    logger.log("Could not get", err);
    throw err;
  }
};

module.exports = {
  storeUserDeviceInfo,
  getUserAuthStatus,
};
