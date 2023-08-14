const firestore = require("../utils/firestore");
const QrCodeAuthModel = firestore.collection("QrCodeAuth");

/**
 * Stores the user device info
 *
 * @param userDeviceInfoData { Object }: User device info data object to be stored in DB
 * @return {Promise<{userDeviceInfoData|Object}>}
 */

const updateStatus = async (userId, authStatus = "NOT_INIT", token) => {
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
      token: `${token}`,
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
    await QrCodeAuthModel.doc(userId).set(userDeviceInfoData);

    return { userDeviceInfoData };
  } catch (err) {
    logger.error("Error in storing user device info.", err);
    throw err;
  }
};

const retrieveUserDeviceInfo = async ({ deviceId, userId }) => {
  let queryDocument;
  try {
    if (deviceId) {
      queryDocument = await QrCodeAuthModel.where("device_id", "==", deviceId).get();
    } else if (userId) {
      queryDocument = await QrCodeAuthModel.where("user_id", "==", userId)
        .where("authorization_status", "==", "NOT_INIT")
        .get();
    }
    const userData = queryDocument?.docs[0];

    if (!userData) {
      return {
        userExists: false,
      };
    }
    return {
      userExists: true,
      data: userData.data(),
    };
  } catch (err) {
    logger.error("Error in retrieving user device info", err);
    throw err;
  }
};

module.exports = {
  updateStatus,
  storeUserDeviceInfo,
  retrieveUserDeviceInfo,
};
