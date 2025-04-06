import chai from "chai";
import config from "config";

import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import userData from "../fixtures/user/user.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";

const { expect } = chai;
const cookieName = config.get("userToken.cookieName");
const userData0 = userData[0];

describe("Notify Test", function () {
  let userId0, userIdToken0;

  beforeEach(async function () {
    userId0 = await addUser(userData0);
    userIdToken0 = generateAuthToken({ userId: userId0 });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST call to notify", function () {
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("should send message to specified users", async function () {
      // skipping the test because it connects with firebase cloud messaging service which we are unable to mock.

      const notifyData = { title: "some title", body: "some body", userId: userId0 };

      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      await chai
        .request(app)
        .post("/v1/fcm-tokens")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      const response = await chai
        .request(app)
        .post("/v1/notifications")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...notifyData,
        });
      expect(response).to.have.status(200);
      expect(response.body.message).equals("User notified successfully");
    });

    it("should have title in body ", async function () {
      const notifyData = { body: "some body", userId: userId0 };

      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      await chai
        .request(app)
        .post("/v1/fcm-tokens")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      const response = await chai
        .request(app)
        .post("/v1/notifications")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...notifyData,
        });

      expect(response).to.have.status(400);
      expect(response.body.message).equals('"title" is required');
    });

    it("should have message in body ", async function () {
      const notifyData = { title: "some title", userId: userId0 };

      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      await chai
        .request(app)
        .post("/v1/fcm-tokens")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      const response = await chai
        .request(app)
        .post("/v1/notifications")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...notifyData,
        });

      expect(response).to.have.status(400);
      expect(response.body.message).equals('"body" is required');
    });

    it("should user token exist ", async function () {
      const notifyData = { title: "some title", body: "some body" };

      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      await chai
        .request(app)
        .post("/v1/fcm-tokens")
        .send({
          ...fcmTokenData,
        });

      const response = await chai
        .request(app)
        .post("/v1/notifications")
        .send({
          ...notifyData,
        });

      expect(response).to.have.status(401);
      expect(response.body.message).equals("Unauthenticated User");
    });
  });
});
