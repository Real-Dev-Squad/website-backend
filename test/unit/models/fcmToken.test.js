import { expect } from "chai";
import firestore from "../../../utils/firestore.js";
import { saveFcmToken } from "../../../models/fcmToken.js";
import cleanDb from "../../utils/cleanDb.js";

const fcmTokenModel = firestore.collection("fcmToken");

describe("FCM token", function () {
  describe("Save FCM Token", function () {
    afterEach(async function () {
      await cleanDb();
    });

    it("it should save FCM token", async function () {
      const fcmTokenData = { userId: "jkkshdsjkh", fcmToken: "iedsijdsdj" };
      await saveFcmToken(fcmTokenData);
      const queryResponse = await fcmTokenModel.where("userId", "==", fcmTokenData.userId).get();
      expect(queryResponse.docs[0].data().fcmTokens).includes(fcmTokenData.fcmToken);
    });

    it("it should store another FCM token in same user-id", async function () {
      const fcmTokenData1 = { userId: "jkkshdsjkh", fcmToken: "sdjagkjsd" };
      const fcmTokenData2 = { userId: "jkkshdsjkh", fcmToken: "sdsnkj" };

      await saveFcmToken(fcmTokenData1);
      await saveFcmToken(fcmTokenData2);

      const queryResponse = await fcmTokenModel.where("userId", "==", fcmTokenData1.userId).get();
      expect(queryResponse.docs[0].data().fcmTokens.length).equals(2);
    });
  });
});
