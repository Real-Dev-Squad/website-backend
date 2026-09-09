const { expect } = require("chai");
const { request } = require("chai-http");
const sinon = require("sinon");
const app = require("../../server");
const cookieName = config.get("userToken.cookieName");
const { subscribedMessage, unSubscribedMessage, subscriptionData } = require("../fixtures/subscription/subscription");
const addUser = require("../utils/addUser");
const authService = require("../../services/authService");
const nodemailer = require("nodemailer");
const nodemailerMock = require("nodemailer-mock");
const userData = require("../fixtures/user/user")();
let userId = "";
const superUser = userData[4];
let superUserAuthToken = "";
describe("/subscription email notifications", function () {
  let jwt;

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
  });

  it("Should return 401 if the user is not logged in", function (done) {
    request
      .execute(app)
      .post("/subscription?dev=true")
      .end((err, res) => {
        if (err) {
          return done();
        }
        expect(res).to.have.status(401);
        expect(res.body).to.be.a("object");
        expect(res.body.message).to.equal("Unauthenticated User");
        return done();
      });
  });

  it("should add user's data and make them subscribe to us.", function (done) {
    request
      .execute(app)
      .post(`/subscription?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .send(subscriptionData)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(201);
        expect(res.body).to.equal(subscribedMessage);
        return done();
      });
  });

  it("should unsubscribe the user", function (done) {
    request
      .execute(app)
      .patch(`/subscription?dev=true`)
      .set("cookie", `${cookieName}=${jwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.equal(unSubscribedMessage);
        return done();
      });
  });

  describe("/notify endpoint", function () {
    beforeEach(async function () {
      const superUserId = await addUser(superUser);
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
      sinon.stub(nodemailerMock, "createTransport").callsFake(nodemailerMock.createTransport);
    });

    afterEach(function () {
      sinon.restore();
      nodemailerMock.mock.reset();
    });

    it("Should return 401 if the super user is not logged in", function (done) {
      request
        .execute(app)
        .get("/subscription/notify?dev=true")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });

    it("should handle errors if sending email fails", function (done) {
      sinon.stub(nodemailer, "createTransport").callsFake(() => {
        throw new Error("Transport error");
      });

      request
        .execute(app)
        .get("/subscription/notify?dev=true")
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("message", "An internal server error occurred");
          return done();
        });
    });
  });
});
