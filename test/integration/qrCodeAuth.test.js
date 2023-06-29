const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const qrCodeAuthModel = require("../../models/qrCodeAuth");
const authService = require("../../services/authService");
const config = require("config");
const cookieName = config.get("userToken.cookieName");

const { userDeviceInfoDataArray } = require("../fixtures/userDeviceInfo/userDeviceInfo");

const addUser = require("../utils/addUser");

chai.use(chaiHttp);

describe("QrCodeAuth", function () {
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

  describe("PATCH CALL", function () {
    it("Should fail with 401 when cookie is invalid", function (done) {
      chai
        .request(app)
        .patch("/auth/qr-code-auth/authorization_status/")
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
});
