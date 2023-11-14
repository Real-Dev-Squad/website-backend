const chai = require("chai");
const expect = chai.expect;
const firestore = require("../../../utils/firestore");
const { saveFcmToken } = require("../../../models/fcmToken");
const fcmTokenModel = firestore.collection("fcmToken");

describe("FCM token test", function () {
  describe("Save FCM Token", function () {
    test("it should save FCM token", async function () {
      const fcmTokenData = { userId: "jkkshdsjkh", fcmToken: "iedsijdsdj" };
      await saveFcmToken();
      const queryResponse = fcmTokenModel.where("userId", "==", fcmTokenData.userId);
      expect(queryResponse.fcmTokens).includes(fcmTokenData.fcmToken);
    });
  });
});
