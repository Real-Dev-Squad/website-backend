const firestore = require("../utils/firestore");
const userDeviceInfoModel = firestore.collection("userDeviceInfo");
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
      await userDeviceInfoModel.doc(userId).set(userDeviceInfoData);
    } else {
      throw new Error(USER_DOES_NOT_EXIST_ERROR);
    }
    return { userDeviceInfoData };
  } catch (err) {
    logger.error("Error in storing user device info.", err);
    throw err;
  }
};

module.exports = {
  storeUserDeviceInfo,
};
