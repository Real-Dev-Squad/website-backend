// @ts-nocheck

import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import config from "config";

import app from "../../server.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";
import * as answerQuery from "../../models/answers.js";
import * as authService from "../../services/authService.js";
const cookieName = config.get("userToken.cookieName");

import { SAMPLE_ANSWER_DATA } from "../fixtures/answers/answers.js";
import userData from "../fixtures/user/user.js";
const defaultUser = userData[16];
const superUser = userData[4];
const memberUser = userData[6];

import { AnswerStatus } from "../../typeDefinitions/answers.js";

chai.use(chaiHttp);

describe("answers", function () {
  let defaultUserAuthToken: string;
  let userId: string;
  let superUserAuthToken: string;
  let memberAuthToken: string;

  beforeEach(async function () {
    userId = await addUser(defaultUser);
    defaultUserAuthToken = authService.generateAuthToken({ userId });

    const superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });

    const memberUserId = await addUser(memberUser);
    memberAuthToken = authService.generateAuthToken({ userId: memberUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST answers - createAnswer", function () {
    afterEach(function () {
      sinon.restore();
    });

    it("should return 500 if server fails to process the request", function (done) {
      sinon.stub(answerQuery, "createAnswer").throws(new Error());

      chai
        .request(app)
        .post("/answers")
        .send(SAMPLE_ANSWER_DATA[1])
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.message).to.equal("An internal server error occurred");

          return done();
        });
    });

    it("should create and return answer", function (done) {
      sinon.stub(answerQuery, "createAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      chai
        .request(app)
        .post("/answers")
        .send(SAMPLE_ANSWER_DATA[1])
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body.data.id).to.equal("dummy-answer-id-2");

          Object.keys(SAMPLE_ANSWER_DATA[2]).forEach((key) => {
            expect(response.body.data[key]).to.equal(SAMPLE_ANSWER_DATA[2][key]);
          });
          return done();
        });
    });
  });

  describe("PATCH answers - updateAnswer", function () {
    beforeEach(function () {
      sinon.stub(answerQuery, "createAnswer").returns(SAMPLE_ANSWER_DATA[2]);
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should return 500 if server fails to process the request", function (done) {
      sinon.stub(answerQuery, "updateAnswer").throws(new Error());

      const payload: { status: AnswerStatus } = {
        status: "REJECTED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.message).to.equal("An internal server error occurred");

          return done();
        });
    });

    it("should update the status with REJECTED value and set reviewed_by with rds user id if user is super user", function (done) {
      sinon.stub(answerQuery, "updateAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      const payload: { status: AnswerStatus } = {
        status: "REJECTED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(204);

          return done();
        });
    });

    it("should update the status with APPROVED value and set reviewed_by with rds user id if user is super user", function (done) {
      sinon.stub(answerQuery, "updateAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      const payload: { status: AnswerStatus } = {
        status: "APPROVED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(204);

          return done();
        });
    });

    it("should update the status with REJECTED value and set reviewed_by with rds user id if user is member", function (done) {
      sinon.stub(answerQuery, "updateAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      const payload: { status: AnswerStatus } = {
        status: "REJECTED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${memberAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(204);

          return done();
        });
    });

    it("should update the status with APPROVED value and set reviewed_by to rds user id if user is member", function (done) {
      sinon.stub(answerQuery, "updateAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      const payload: { status: AnswerStatus } = {
        status: "APPROVED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${memberAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(204);

          return done();
        });
    });

    it("should return not authorized if user is not super user or member", function (done) {
      sinon.stub(answerQuery, "updateAnswer").returns(SAMPLE_ANSWER_DATA[2]);

      const payload: { status: AnswerStatus } = {
        status: "REJECTED",
      };

      chai
        .request(app)
        .patch(`/answers/${SAMPLE_ANSWER_DATA[2].id}`)
        .set("cookie", `${cookieName}=${defaultUserAuthToken}`)
        .send(payload)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.message).to.be.a("string");
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("You are not authorized for this action.");

          return done();
        });
    });
  });
});
