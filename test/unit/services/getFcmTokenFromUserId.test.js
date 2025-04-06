import { expect } from "chai";
import { saveFcmToken } from "../../../models/fcmToken.js";
import cleanDb from "../../utils/cleanDb.js";
import { getFcmTokenFromUserId } from "../../../services/getFcmTokenFromUserId.js";

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
