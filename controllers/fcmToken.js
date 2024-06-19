const { saveFcmToken } = require("../models/fcmToken");
const { Conflict } = require("http-errors");

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
  } catch (error) {
    if (error instanceof Conflict) {
      return res.status(409).json({
        message: error.message
      });
    }
    res.status(500).send("Something went wrong, please contact admin");
  }
  return res.status(500).send("Internal server error");
};

module.exports = {
  fcmTokenController
};
