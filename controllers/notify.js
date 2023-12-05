const admin = require("firebase-admin");
const firestore = require("../utils/firestore");
const memberRoleModel = firestore.collection("member-group-roles");
const usersModel = firestore.collection("users");

const fcmTokenModel = firestore.collection("fcmToken");

/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const notifyController = async (req, res) => {
  const { title, body, userId, groupRoleId } = req.body;
  let fcmTokens = [];

  const getFcmTokenFromUserId = async (userId) => {
    if (!userId) return [];
    const fcmTokenSnapshot = await fcmTokenModel.where("userId", "==", userId).limit(1).get();

    if (!fcmTokenSnapshot.empty) {
      return fcmTokenSnapshot.docs[0].data().fcmTokens;
    }
    return [];
  };
  if (userId) {
    const fcmTokensFromUserId = await getFcmTokenFromUserId(userId);
    fcmTokens = [...fcmTokens, ...fcmTokensFromUserId];
  }

  if (groupRoleId) {
    let discordIds = [];
    const querySnapshot = await memberRoleModel.where("roleid", "==", groupRoleId).get();
    if (!querySnapshot.empty) {
      discordIds = querySnapshot.docs.map((doc) => doc.data());
    }

    const discordIdsPromiseArray = discordIds.map(async (item) => {
      const userSnapshot = await usersModel.where("discordId", "==", item.userid).get();
      if (!userSnapshot.empty) {
        return userSnapshot.docs[0].id;
      }
      return undefined;
    });

    const userIdFromDiscordId = await Promise.all(discordIdsPromiseArray);

    const fcmtokensPromiseArray = userIdFromDiscordId.map(async (userId) => {
      const fcmTokensFromUserId = await getFcmTokenFromUserId(userId);
      fcmTokens = [...fcmTokens, ...fcmTokensFromUserId];
    });
    await Promise.all(fcmtokensPromiseArray);
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
  res.status(200).send(`fcm tokens device will get notified: ${Array.from(setOfFcmTokens)}`);
};

module.exports = {
  notifyController,
};
