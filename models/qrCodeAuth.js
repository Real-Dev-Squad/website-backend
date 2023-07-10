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

const updateStatus = async (userId, authStatus = "NOT_INIT") => {
  try {
    const authData = await QrCodeAuthModel.doc(userId).get();

    if (!authData.data()) {
      return {
        userExists: false,
      };
    }

    await QrCodeAuthModel.doc(userId).set({
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

module.exports = {
  updateStatus,
  storeUserDeviceInfo,
};
