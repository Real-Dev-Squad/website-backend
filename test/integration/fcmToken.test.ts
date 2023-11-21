const chai = require("chai");
const { expect } = chai;
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const addUser = require("../utils/addUser");
const userData = require("../fixtures/user/user")();

const userData0 = userData[0];
const authService = require("../../services/authService");

const cookieName = config.get("userToken.cookieName");

describe("Fcm Token Test", function () {
  let userId0, userIdToken0;

  beforeEach(async function () {
    userId0 = await addUser(userData0);
    userIdToken0 = authService.generateAuthToken({ userId: userId0 });
  });
  afterEach(async function () {
    await cleanDb();
  });

  describe("POST call to save the fcm", function () {
    it("should save the fcm token", async function () {
      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      const response = await chai
        .request(app)
        .post("/fcm-token")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      expect(response).to.have.status(200);
      expect(response.body.message).equals("Device registered successfully");
    });

    it("should not duplicate fcm token", async function () {
      const fcmTokenData = { fcmToken: "iedsijdsdj" };
      await chai
        .request(app)
        .post("/fcm-token")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      const response = await chai
        .request(app)
        .post("/fcm-token")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });

      expect(response).to.have.status(409);
      expect(response.body.message).equals("Device Already Registered");
    });
    it("should have fcm token", async function () {
      const fcmTokenData = {};
      const response = await chai
        .request(app)
        .post("/fcm-token")
        .set("cookie", `${cookieName}=${userIdToken0}`)
        .send({
          ...fcmTokenData,
        });
      expect(response).to.have.status(400);
      expect(response.body.message).equals('"fcmToken" is required');
    });
    it("should have user token", async function () {
      const fcmTokenData = { fcmToken: "iedsijdsdj" };

      const response = await chai
        .request(app)
        .post("/fcm-token")
        .send({
          ...fcmTokenData,
        });

      expect(response).to.have.status(401);
      expect(response.body.message).equals("Unauthenticated User");
    });

    it("should have user token and fcm token", async function () {
      const fcmTokenData = {};

      const response = await chai
        .request(app)
        .post("/fcm-token")
        .send({
          ...fcmTokenData,
        });

      expect(response).to.have.status(400);
      expect(response.body.message).equals('"fcmToken" is required');
    });
  });
});
