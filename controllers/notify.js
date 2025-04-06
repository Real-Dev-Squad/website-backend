import { getMessaging } from "firebase-admin";
import { getFcmTokenFromUserId } from "../services/getFcmTokenFromUserId.js";
import { getUserIdsFromRoleId } from "../services/getUserIdsFromRoleId.js";

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const notifyController = async (req, res) => {
  const { title, body, userId, groupRoleId } = req.body;
  let fcmTokens = [];
  if (userId) {
    const fcmTokensFromUserId = await getFcmTokenFromUserId(userId);
    fcmTokens = [...fcmTokens, ...fcmTokensFromUserId];
  }

  let userIdsFromRoleId = [];
  let fcmTokensFromUserId;
  if (groupRoleId) {
    try {
      userIdsFromRoleId = await getUserIdsFromRoleId(groupRoleId);
    } catch (error) {
      logger.error("error ", error);
      throw error;
    }

    const fcmTokensPromiseArray = userIdsFromRoleId.map(async (userId) => {
      try {
        fcmTokensFromUserId = await getFcmTokenFromUserId(userId);
      } catch (error) {
        logger.error("error ", error);
        throw error;
      }
      fcmTokens = [...fcmTokens, ...fcmTokensFromUserId];
    });
    try {
      await Promise.all(fcmTokensPromiseArray);
    } catch (error) {
      logger.error("error", error);
      throw error;
    }
  }

  const setOfFcmTokens = new Set(fcmTokens);

  const message = {
    notification: {
      title: title || "Notification Title",
      body: body || "Notification Body",
    },
    data: {
      key1: "value1",
      key2: "value2",
    },
    tokens: Array.from(setOfFcmTokens),
  };

  function calculateMessageSize(message) {
    const byteArray = new TextEncoder().encode(message);

    const byteLength = byteArray.length;

    const kilobytes = byteLength / 1024;

    return kilobytes;
  }
  if (calculateMessageSize(message) >= 2) {
    res.error(401).send("Message length exceeds");
  }

  getMessaging()
    .sendEachForMulticast(message)
    .then(() => res.status(200).json({ status: 200, message: "User notified successfully" }))
    .catch((error) => {
      logger.error("Error sending message:", error);
      res.status(500).json({ status: 500, message: "Internal server error" });
    });
};

export { notifyController };
