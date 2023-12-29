const chai = require("chai");
const expect = chai.expect;
const { saveFcmToken } = require("../../../models/fcmToken");
const cleanDb = require("../../utils/cleanDb");
const { getFcmTokenFromUserId } = require("../../../services/getFcmTokenFromUserId");

describe("FCM token services", function () {
  describe("Get FCM token from user id", function () {
    beforeEach(async function () {
      const fcmTokenData = { userId: "jkkshdsjkh", fcmToken: "iedsijdsdj" };

      await saveFcmToken(fcmTokenData);
    });
    afterEach(async function () {
      await cleanDb();
    });
    it("Get FCM token from user id", async function () {
      const fcmToken = await getFcmTokenFromUserId("jkkshdsjkh");
      expect(fcmToken[0]).equals("iedsijdsdj");
    });

    it("will return blank array for invalid user id", async function () {
      const fcmToken = await getFcmTokenFromUserId("sdkfskf");
      expect(fcmToken.length).equals(0);
    });
  });
});
