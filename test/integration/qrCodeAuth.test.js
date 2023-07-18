const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const userData = require("../fixtures/user/user")();
const { userDeviceInfoDataArray } = require("../fixtures/qrCodeAuth/qrCodeAuth");
const addUser = require("../utils/addUser");
const qrCodeAuthModel = require("../../models/qrCodeAuth");
const authService = require("../../services/authService");
const config = require("config");
const cookieName = config.get("userToken.cookieName");

// Import fixtures
let userDeviceInfoData;
let wrongUserDeviceInfoData;
let userId;
const user = userData[0];

describe("QrCodeAuth", function () {
  describe("POST call for adding user", function () {
    beforeEach(async function () {
      userId = await addUser(user);
      userDeviceInfoData = { ...userDeviceInfoDataArray[0], user_id: userId };
      wrongUserDeviceInfoData = userDeviceInfoDataArray[0];
    });
    afterEach(async function () {
      await cleanDb();
      sinon.restore();
    });
    it("Should return success response after storing user device info for mobile auth", function (done) {
      chai
        .request(app)
        .post("/auth/qr-code-auth")
        .send(userDeviceInfoData)
        .end((err, response) => {
          if (err) {
            return done(err);
          }
          expect(response).to.have.status(201);
          expect(response.body.userDeviceInfoData).to.be.an("object");
          expect(response.body.message).to.equal("User Device Info added successfully!");
          expect(response.body.userDeviceInfoData.user_id).to.be.a("string");
          expect(response.body.userDeviceInfoData.device_info).to.be.a("string");
          expect(response.body.userDeviceInfoData.device_id).to.be.a("string");

          return done();
        });
    });

    it("Should return a 500 status code and the correct error message when an error occurs while storing user device info", function (done) {
      chai
        .request(app)
        .post("/auth/qr-code-auth")
        .send(wrongUserDeviceInfoData)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(500);
          expect(res.body).to.eql({
            statusCode: 500,
            error: "Internal Server Error",
            message: "An internal server error occurred",
          });

          return done();
        });
    });
  });
  describe("PATCH CALL for updating auth status", function () {
    let jwt;
    let userId = "";
    let userDeviceInfoData;
    let userDeviceInfoWithAuthStatus;

    beforeEach(async function () {
      userId = await addUser();
      jwt = authService.generateAuthToken({ userId });
      userDeviceInfoData = { ...userDeviceInfoDataArray[0], user_id: userId };
      userDeviceInfoWithAuthStatus = { ...userDeviceInfoData, authorization_status: "NOT_INIT" };
    });

    afterEach(async function () {
      await cleanDb();
    });
    it("Should fail with 401 when cookie is invalid", function (done) {
      chai
        .request(app)
        .patch("/auth/qr-code-auth/authorization_status/AUTHORIZED")
        .set("cookie", `${cookieName}=xyzdddaa`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          expect(res.body.error).to.equal("Unauthorized");

          return done();
        });
    });

    it("should fail with 404, when the user is not found", function (done) {
      chai
        .request(app)
        .patch("/auth/qr-code-auth/authorization_status/AUTHORIZED")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Document not found!");
          expect(res.body.error).to.equal("Not Found");

          return done();
        });
    });

    it("should throw 400, if authorization value is anything other than the valid values [REJECTED, AUTHORIZED, NOT_INIT]", function (done) {
      chai
        .request(app)
        .patch("/auth/qr-code-auth/authorization_status/1234")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal('"authorization_status" must be one of [AUTHORIZED, REJECTED, NOT_INIT]');
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("should successfully update the auth status of the user", function (done) {
      qrCodeAuthModel.storeUserDeviceInfo(userDeviceInfoWithAuthStatus);
      chai
        .request(app)
        .patch("/auth/qr-code-auth/authorization_status/AUTHORIZED")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal(`Authentication document for user ${userId} updated successfully`);

          return done();
        });
    });
  });

  describe("GET call for fetching user device info", function () {
    let userId = "";
    let userDeviceInfoData;
    beforeEach(async function () {
      userId = await addUser(user);
      userDeviceInfoData = {
        ...userDeviceInfoDataArray[0],
        user_id: userId,
        authorization_status: "NOT_INIT",
        access_token: "ACCESS_TOKEN",
      };
    });
    afterEach(async function () {
      await cleanDb();
    });

    it("should successfully fetch the user device info", function (done) {
      qrCodeAuthModel.storeUserDeviceInfo(userDeviceInfoData).then((res) => console.log(res));

      chai
        .request(app)
        .get(`/auth/qr-code-auth?device_id=${userDeviceInfoData.device_id}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.data.user_id).to.be.a("string");
          expect(res.body.data.device_info).to.be.a("string");
          expect(res.body.data.device_id).to.be.a("string");
          expect(res.body.data.authorization_status).to.be.a("string");
          expect(res.body.data.access_token).to.be.a("string");
          expect(res.body.message).to.equal(`Authentication document retrieved successfully.`);

          return done();
        });
    });

    it("should fail with 404, when the document is not found", function (done) {
      chai
        .request(app)
        .get(`/auth/qr-code-auth?device_id=${userDeviceInfoData.device_id}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal(`User with id ${userDeviceInfoData.device_id} does not exist.`);
          expect(res.body.error).to.equal("Not Found");

          return done();
        });
    });
  });
});
