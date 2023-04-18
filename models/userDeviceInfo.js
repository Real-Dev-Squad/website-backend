const firestore = require("../utils/firestore");
const userDeviceInfoModel = firestore.collection("userDeviceInfo");

/**
 * Stores the user device info
 *
 * @param userDeviceInfoData { Object }: User device info data object to be stored in DB
 * @return {Promise<{userDeviceInfoData|Object}>}
 */
const storeUserDeviceInfo = async (userDeviceInfoData) => {
  try {
    const { userId } = userDeviceInfoData;
    if (userId.length > 0) {
      await userDeviceInfoModel.doc(userId).set(userDeviceInfoData);
    }
    return { userDeviceInfoData };
  } catch (err) {
    logger.error("Error in storing user device info", err);
    throw err;
  }
};

module.exports = {
  storeUserDeviceInfo,
};
