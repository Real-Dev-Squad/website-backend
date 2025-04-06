import { saveFcmToken } from "../models/fcmToken.js";
import { Conflict } from "http-errors";

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
export const fcmTokenController = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const { id } = req.userData;

    await saveFcmToken(id, fcmToken);
    return res.json({
      message: "FCM token saved successfully",
    });
  } catch (error) {
    if (error instanceof Conflict) {
      return next(error);
    }
    logger.error("Error in fcmTokenController: ", error);
    return next(error);
  }
};
