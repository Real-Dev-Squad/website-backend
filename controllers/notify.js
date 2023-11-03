const admin = require("firebase-admin");
const firestore = require("../utils/firestore");

const fcmTokenModel = firestore.collection("fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const notifyController = async (req, res) => {
  // const fcmTokenSnapshot = fcmTokenModel.where("userId", "==", fcmTokenData.userId).limit(1).get();
  // console.log('fcmTokenSnap', fcmTokenSnapshot)
  // title , description ,
  const {
    title,
    body,
    userId,
    // groupRole
  } = req.body;

  let fcmTokens = [];
  if (userId) {
    const fcmTokenSnapshot = await fcmTokenModel.where("userId", "==", userId).limit(1).get();

    if (!fcmTokenSnapshot.empty) {
      fcmTokenSnapshot.forEach((item) => {
        fcmTokens = [...fcmTokens, ...item.data().fcmTokens];
      });
    }
  }

  const message = {
    notification: {
      title: title && "Notification Title",
      body: body && "Notification Body",
    },
    data: {
      key1: "value1",
      key2: "value2",
    },
    tokens: fcmTokens,
  };

  // const { userName,  } = req.body;

  // Save the FCM token to your database or perform other necessary actions.
  // You can associate the token with a user or device, for example.

  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      const successCount = response.responses.filter((r) => r.success).length;
      logger.info("Successfully sent message to", successCount, "devices.");
    })
    .catch((error) => {
      logger.error("Error sending message:", error);
    });
  res.status(200).send(`fcm tokens device will get notified: ${fcmTokens}`);
};

module.exports = {
  notifyController,
};
