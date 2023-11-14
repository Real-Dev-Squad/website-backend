const { saveFcmToken } = require("../models/fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fcmTokenController = async (req, res) => {
  const { fcmToken } = req.body;

  // Save the FCM token to your database or perform other necessary actions.
  // You can associate the token with a user or device, for example.

  const fcmTokenId = await saveFcmToken({ userId: req.userData.id, fcmToken });
  if (fcmTokenId) res.status(200).json({ status: 200, message: "Device registered successfully" });
  else res.status(409).json({ status: 409, message: "Device Already Registered" });
};

module.exports = {
  fcmTokenController,
};
