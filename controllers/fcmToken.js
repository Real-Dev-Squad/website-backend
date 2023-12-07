const { saveFcmToken } = require("../models/fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const fcmTokenController = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    const fcmTokenId = await saveFcmToken({ userId: req.userData.id, fcmToken });
    if (fcmTokenId) res.status(200).json({ status: 200, message: "Device registered successfully" });
    else res.status(409).json({ status: 409, message: "Device Already Registered" });
  } catch (error) {
    res.status(500).send("Something went wrong, please contact admin");
  }
};

module.exports = {
  fcmTokenController,
};
