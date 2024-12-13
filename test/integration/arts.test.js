const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const artsQuery = require("../../models/arts");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const arts = require("../../models/arts");
const cleanDb = require("../utils/cleanDb");

// Import fixtures
const artData = require("../fixtures/arts/arts")();

const config = require("config");
const cookieName = config.get("userToken.cookieName");
const { addJoinData } = require("../../models/users");
const joinData = require("../fixtures/user/join");

chai.use(chaiHttp);

describe("Arts", function () {
  let jwt;
  let userId = "";

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    await arts.addArt(artData[0], userId);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /arts/user/add", function () {
    it("Should add the art in system", function (done) {
      chai
        .request(app)
        .post("/arts/user/add")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(artData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Art successfully added!");

          return done();
        });
    });

    it("Should return 401, for Unauthenticated User", function (done) {
      chai
        .request(app)
        .post("/arts/user/add")
        .send(artData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("GET /arts", function () {
    it("Should get all the arts in system", function (done) {
      chai
        .request(app)
        .get("/arts")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Arts returned successfully!");
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);

          return done();
        });
    });
  });

  describe("GET /arts/user/self", function () {
    it("Should get all the arts of the user", function (done) {
      chai
        .request(app)
        .get("/arts/user/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User arts returned successfully!");
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);
          expect(res).to.have.header(
            "X-Deprecation-Warning",
            "WARNING: This endpoint is deprecated and will be removed in the future. Please use /arts/:userId to get the art details."
          );

          return done();
        });
    });

    it("Should return 401, for Unauthenticated User", function (done) {
      chai
        .request(app)
        .get("/arts/user/self")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("GET /arts/:userId", function () {
    beforeEach(async function () {
      await addJoinData(joinData(userId)[0]);
    });

    it("Should get all the arts of the user", function (done) {
      chai
        .request(app)
        .get(`/arts/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal(`User Arts of userId ${userId} returned successfully`);
          expect(res.body.arts).to.be.a("array");
          expect(res.body.arts[0]).to.be.a("object");
          expect(res.body.arts[0].title).to.equal(artData[0].title);

          return done();
        });
    });

    it("Should return 401, for Unauthenticated User", function (done) {
      chai
        .request(app)
        .get(`/arts/${userId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });

    it("Should return 204 No Content if no arts are found", function (done) {
      sinon.stub(artsQuery, "fetchUserArts").resolves([]);

      chai
        .request(app)
        .get(`/arts/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          artsQuery.fetchUserArts.restore();

          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);
          expect(res.body).to.deep.equal({});
          return done();
        });
    });

    it("Should return 500 Internal Server Error if there is an exception", function (done) {
      sinon.stub(artsQuery, "fetchUserArts").throws(new Error("Database error"));

      chai
        .request(app)
        .get(`/arts/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          artsQuery.fetchUserArts.restore();

          if (err) {
            return done(err);
          }

          expect(res).to.have.status(500);
          expect(res.body).to.deep.equal({
            statusCode: 500,
            error: "Internal Server Error",
            message: "An internal server error occurred",
          });

          return done();
        });
    });
  });
});
