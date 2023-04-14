const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const { sessionsData } = require("../fixtures/sessions/sessions");
const sessionId = sessionsData[0].id;

const userData = require("../fixtures/user/user")();

const defaultUser = userData[0];

const config = require("config");
const Sinon = require("sinon");
const { EventTokenService } = require("../../services/EventTokenService");
const { EventAPIService } = require("../../services/EventAPIService");
const cookieName = config.get("userToken.cookieName");

const tokenService = new EventTokenService();
const apiService = new EventAPIService(tokenService);

chai.use(chaiHttp);

describe("Sessions", function () {
  let authToken;
  let userId;

  beforeEach(async function () {
    userId = await addUser(defaultUser);
    authToken = authService.generateAuthToken({ userId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /sessions", function () {
    it("returns all sessions when no query params are provided", function (done) {
      chai
        .request(app)
        .get("/sessions")
        .set("cookie", `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't get sessions. Please try again later");

          return done();
        });
    });

    it("should return all sessions information based on query parameters", function (done) {
      chai
        .request(app)
        .get("/sessions?hits=10&enabled=false")
        .set("cookie", `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.have.all.keys("limit", "data", "last");
          expect(response.body.data).to.be.an("array");
          expect(response.body.data.length).to.be.at.most(10);

          return done();
        });
    });

    it("returns an error if there is a problem retrieving sessions", function (done) {
      // Mock the API service to throw an error
      Sinon.stub(apiService, "get").rejects({ code: "ERR_BAD_REQUEST" });

      chai
        .request(app)
        .get("/sessions")
        .set("cookie", `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response).to.have.status(500);
          expect(response.body.error).to.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.equal("Couldn't get sessions. Please try again later");

          // Restore the original behavior of the API service
          apiService.get.restore();

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .get("/sessions?hits=10&enabled=false")
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
  });

  describe("GET /session/:id", function () {
    it("should return session details when a valid session id is provided", function (done) {
      chai
        .request(app)
        .get(`/sessions/${sessionId}`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body).to.have.property("id").that.is.a("string");
          expect(response.body).to.have.property("room_id").that.is.a("string");
          expect(response.body).to.have.property("customer_id").that.is.a("string");
          expect(response.body).to.have.property("app_id").that.is.a("string");
          expect(response.body).to.have.property("active").that.is.a("boolean");
          expect(response.body.peers).to.be.an("object");
          expect(response.body).to.have.property("created_at").that.is.a("string");
          expect(response.body).to.have.property("updated_at").that.is.a("string");
          expect(response.body).to.have.property("_id").that.is.a("string");
          return done();
        });
    });

    it("should return an error message when an invalid session id is provided", function (done) {
      const sessionId = "invalid-id";
      chai
        .request(app)
        .get(`/sessions/${sessionId}`)
        .set("cookie", `${cookieName}=${authToken}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(500);
          expect(response.body.error).to.be.equal("ERR_BAD_REQUEST");
          expect(response.body.message).to.be.equal("Unable to retrieve session details");

          return done();
        });
    });

    it("should return unauthorized error if user is not authenticated", function (done) {
      chai
        .request(app)
        .get(`/sessions/${sessionId}`)
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
  });
});
