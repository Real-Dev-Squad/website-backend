const { saveFcmToken } = require("../models/fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fcmTokenController = (req, res) => {
  try {
    const { fcmToken } = req.body;

    const fcmTokenId = saveFcmToken({ userId: req.userData.id, fcmToken });

    res.status(200).send(`FCM token saved: ${fcmTokenId}`);
  } catch (error) {
    throw new Error(error);
  }

  // Save the FCM token to your database or perform other necessary actions.
  // You can associate the token with a user or device, for example.
};

module.exports = {
  fcmTokenController,
};
