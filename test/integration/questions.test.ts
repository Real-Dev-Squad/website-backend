// @ts-nocheck

import chai, { expect } from "chai";
import sinon from "sinon";
import config from "config";
import chaiHttp from "chai-http";

import app from "../../server.js";
import * as authService from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";

import * as questionQuery from "../../models/questions.js";

import userData from "../fixtures/user/user.js";
const defaultUser = userData[16];
const superUser = userData[4];

import { SAMPLE_QUESTION_DATA } from "../fixtures/questions/questions.js";
const questionDataWithMaxWords = SAMPLE_QUESTION_DATA[5];

const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("questions", function () {
  let authToken: string;
  let userId: string;
  let superUserAuthToken: string;

  beforeEach(async function () {
    userId = await addUser(defaultUser);
    authToken = authService.generateAuthToken({ userId });

    const superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST questions - createQuestion", function () {
    afterEach(function () {
      sinon.restore();
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .post("/questions")
        .send(questionDataWithMaxWords)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(401);
          expect(response.body.error).to.be.equal("Unauthorized");
          expect(response.body.message).to.be.equal("Unauthenticated User");

          return done();
        });
    });

    it("should return unauthorized is user is not super user", function (done) {
      chai
        .request(app)
        .post("/questions")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(questionDataWithMaxWords)
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

    it("should return 500 if server fails to process the request", function (done) {
      sinon.stub(questionQuery, "createQuestion").throws(new Error());

      chai
        .request(app)
        .post("/questions")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(questionDataWithMaxWords)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.message).to.equal("An internal server error occurred");

          return done();
        });
    });

    it("should create and return the question if the user is super user", function (done) {
      sinon.stub(questionQuery, "createQuestion").resolves(SAMPLE_QUESTION_DATA[6]);

      chai
        .request(app)
        .post("/questions")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(questionDataWithMaxWords)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(201);
          expect(response.body.message).to.equal("Question created and sent successfully to connected peers");
          expect(response.body.data.question).to.equal(SAMPLE_QUESTION_DATA[6].question);
          expect(response.body.data.id).to.equal(SAMPLE_QUESTION_DATA[6].id);
          expect(response.body.data.created_at).to.equal(SAMPLE_QUESTION_DATA[6].created_at);
          expect(response.body.data.created_by).to.equal(SAMPLE_QUESTION_DATA[6].created_by);
          expect(response.body.data.updated_at).to.equal(SAMPLE_QUESTION_DATA[6].updated_at);

          return done();
        });
    });
  });

  // TODO - write tests for this api
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("GET questions - getQuestions", function () {});
});
