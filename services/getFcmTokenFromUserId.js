const firestore = require("../utils/firestore");

const fcmTokenModel = firestore.collection("fcmToken");

export const getFcmTokenFromUserId = async (userId) => {
  if (!userId) return [];
  const fcmTokenSnapshot = await fcmTokenModel.where("userId", "==", userId).limit(1).get();
  if (!fcmTokenSnapshot.empty) {
    return fcmTokenSnapshot.docs[0].data().fcmTokens;
  }
  return [];
};
