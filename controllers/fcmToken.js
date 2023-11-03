const { saveFcmToken } = require("../models/fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fcmTokenController = (req, res) => {
  const { fcmToken } = req.body;

  // Save the FCM token to your database or perform other necessary actions.
  // You can associate the token with a user or device, for example.

  const fcmTokenId = saveFcmToken({ userId: req.userData.id, fcmToken });

  res.status(200).send(`FCM token saved: ${fcmTokenId}`);
};

module.exports = {
  fcmTokenController,
};
