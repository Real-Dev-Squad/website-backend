import app from "../../server.js";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import { Buffer } from "node:buffer";
import config from "config";

import fixture from "../fixtures/badges/badges.js";
import userData from "../fixtures/user/user.js";

import model from "../../models/badges.js";

import { generateAuthToken } from "../../services/authService.js";
import * as imageService from "../../services/imageService.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";

import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../constants/badges.js";
const { CONTROLLERS: CONTROLLERS_SUCCESS_MESSAGES } = SUCCESS_MESSAGES;
const { VALIDATORS: ERROR_MESSAGES_VALIDATORS, MISC } = ERROR_MESSAGES;
const { expect } = chai;

let jwt;
let userId;

const superUser = userData[4];
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Badges", function () {
  before(async function () {
    userId = await addUser(superUser);
    jwt = generateAuthToken({ userId });
  });

  after(async function () {
    await cleanDb();
  });

  describe("GET /badges", function () {
    it("Should get all the list of badges", function (done) {
      sinon.stub(model, "fetchBadges").returns(fixture.BADGES);
      chai
        .request(app)
        .get("/badges")
        .end(function (error, response) {
          if (error) {
            return done();
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body.message).to.equal(CONTROLLERS_SUCCESS_MESSAGES.GET_BADGES);
          expect(response.body.badges).to.be.a("array");
          expect(response.body.badges).to.have.length(3);
          expect(response.body.badges[0]).to.deep.equal(fixture.BADGES[0]);

          return done();
        });
    });
  });

  describe("POST /badges", function () {
    it("Should return user is unauthorized", function (done) {
      chai
        .request(app)
        .post("/badges")
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(401);
          expect(response.body.message).to.contains(MISC.UNAUTHENTICATED_USER);
          expect(response.body.error).to.equal("Unauthorized");
          return done();
        });
    });

    it("Should return file is missing", function (done) {
      chai
        .request(app)
        .post("/badges")
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(400);
          expect(response.body.message).to.contains(ERROR_MESSAGES_VALIDATORS.CREATE_BADGE.FILE_IS_MISSING);
          expect(response.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return API payload failed validation, createdBy is required", function (done) {
      chai
        .request(app)
        .post("/badges")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("file", Buffer.from("something", "utf-8"), "simple.png")
        .field({
          name: "badgexRandom",
        })
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(400);
          expect(response.body.message).to.equal(
            `${ERROR_MESSAGES_VALIDATORS.API_PAYLOAD_VALIDATION_FAILED}, "createdBy" is required`
          );
          expect(response.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return success message, and badge-object", function (done) {
      sinon.stub(imageService, "uploadBadgeImage").returns(fixture.CLOUNDINARY_BADGE_IMAGE_UPLOAD_RESPONSE);
      sinon.stub(model, "createBadge").returns(fixture.EXPECTED_BADGE_OBJECT);
      chai
        .request(app)
        .post("/badges")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("file", Buffer.from("something", "utf-8"), "simple.png")
        .field({
          name: "badgeXrandom",
          createdBy: "shmbajaj",
        })
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(200);
          expect(response.body.message).to.equal(SUCCESS_MESSAGES.CONTROLLERS.POST_BADGE);
          expect(response.body.badge).to.deep.equal(fixture.EXPECTED_BADGE_OBJECT);

          return done();
        });
    });
  });

  describe("POST /badges/assign", function () {
    it(`Should return error message ${ERROR_MESSAGES_VALIDATORS.API_PAYLOAD_VALIDATION_FAILED}, userId is missing`, function (done) {
      chai
        .request(app)
        .post("/badges/assign")
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (error, response) {
          if (error) {
            done();
          }
          expect(response).to.have.status(400);
          expect(response.body.error).to.equal("Bad Request");
          expect(response.body.message).to.equal(
            `${ERROR_MESSAGES_VALIDATORS.API_PAYLOAD_VALIDATION_FAILED}, "userId" is required`
          );
          return done();
        });
    });

    it(`Should validate badgeIds array and assign badges`, function (done) {
      chai
        .request(app)
        .post("/badges/assign")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          userId,
          badgeIds: ["1", "2", "3"],
        })
        .end(function (error, response) {
          if (error) {
            done();
          }
          expect(response).to.have.status(200);
          expect(response.body.message).to.equal(SUCCESS_MESSAGES.CONTROLLERS.POST_USER_BADGES);
          return done();
        });
    });
  });

  describe("DELETE /badges/remove", function () {
    it("Should remove assigned badges from a user", function (done) {
      chai
        .request(app)
        .delete("/badges/remove")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          userId: "a-random-user-id",
          badgeIds: ["1", "2", "3"],
        })
        .end(function (error, response) {
          if (error) {
            done();
          }
          expect(response).to.have.status(200);
          expect(response.body.message).to.equal(SUCCESS_MESSAGES.CONTROLLERS.DELETE_USER_BADGES);
          return done();
        });
    });
  });
});
