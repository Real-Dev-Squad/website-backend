const firestore = require("../utils/firestore");
const { Conflict } = require("http-errors");

const fcmTokenModel = firestore.collection("fcmToken");

const saveFcmToken = async (fcmTokenData) => {
  try {
    const fcmTokenSnapshot = await fcmTokenModel.where("userId", "==", fcmTokenData.userId).limit(1).get();

    if (fcmTokenSnapshot.empty) {
      const fcmToken = await fcmTokenModel.add({
        userId: fcmTokenData.userId,
        fcmTokens: [fcmTokenData.fcmToken],
      });
      return fcmToken.id;
    } else {
      let fcmTokenObj = {};
      fcmTokenSnapshot.forEach((fcmToken) => {
        fcmTokenObj = {
          id: fcmToken.id,
          ...fcmToken.data(),
        };
      });
      if (!fcmTokenObj.fcmTokens.includes(fcmTokenData.fcmToken)) {
        fcmTokenObj.fcmTokens.push(fcmTokenData.fcmToken);
        await fcmTokenModel.doc(fcmTokenObj.id).update({
          fcmTokens: fcmTokenObj.fcmTokens,
        });
        return fcmTokenObj.id;
      } else {
        throw new Conflict("Device Already Registered");
      }
    }
  } catch (err) {
    logger.error("Error in adding fcm token", err);
    throw err;
  }
};

module.exports = { saveFcmToken };
