import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import config from "config";
import nodemailer from "nodemailer";
import nodemailerMock from "nodemailer-mock";

import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import userData from "../fixtures/user/user.js";
import { subscribedMessage, unSubscribedMessage, subscriptionData } from "../fixtures/subscription/subscription.js";

const { expect } = chai;
const cookieName = config.get("userToken.cookieName");
let userId = "";
const superUser = userData[4];
let superUserAuthToken = "";

chai.use(chaiHttp);

describe("/subscription email notifications", function () {
  let jwt;

  beforeEach(async function () {
    userId = await addUser();
    jwt = generateAuthToken({ userId });
  });

  it("Should return 401 if the user is not logged in", function (done) {
    chai
      .request(app)
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
    chai
      .request(app)
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
    chai
      .request(app)
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
      superUserAuthToken = generateAuthToken({ userId: superUserId });
      sinon.stub(nodemailerMock, "createTransport").callsFake(nodemailerMock.createTransport);
    });

    afterEach(function () {
      sinon.restore();
      nodemailerMock.mock.reset();
    });

    it("Should return 401 if the super user is not logged in", function (done) {
      chai
        .request(app)
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

      chai
        .request(app)
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
