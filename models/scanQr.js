const firestore = require("../utils/firestore");
const userDeviceInfoModel = firestore.collection("userDeviceInfo");

/**
 * Check whether user has scanned QR or not
 *
 * @param userId { String }: User Id  to check in userDeviceInfo collection
 * @return {Promise<{userDeviceInfoData|Object}>}
 */
const fetchUserDeviceInfo = async (userId) => {
  try {
    const user = await userDeviceInfoModel.doc(userId).get();
    if (user.data()) {
      const userDeviceInfoData = user.data();
      return { userDeviceInfoData };
    } else {
      return { message: "Not scanned the QR yet" };
    }
  } catch (err) {
    logger.error("Error in fetching data", err);
    throw err;
  }
};

module.exports = {
  fetchUserDeviceInfo,
};
