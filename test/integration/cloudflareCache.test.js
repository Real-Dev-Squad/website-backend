const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const sinon = require("sinon");

const app = require("../../server");
const addUser = require("../utils/addUser");
const authService = require("../../services/authService");
const cleanDb = require("../utils/cleanDb");
const logsQuery = require("../../models/logs");

const config = require("config");
const cookieName = config.get("userToken.cookieName");
const cloudflare = require("../../services/cloudflareService");

const userData = require("../fixtures/user/user")();
const cacheData = require("../fixtures/cloudflareCache/data");

const superUser = userData[4];

chai.use(chaiHttp);

describe("Purged Cache Metadata", function () {
  let jwt;

  after(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("GET /cache", function () {
    before(async function () {
      await cleanDb();
      const userId = await addUser(userData[0]);
      jwt = authService.generateAuthToken({ userId });
    });

    it("Should return last purged cache metadata if no cache logs in last 24 hours found", function (done) {
      sinon.stub(logsQuery, "fetchLastAddedCacheLog").returns(cacheData.cacheModelData);
      chai
        .request(app)
        .get("/cache")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.timeLastCleared).to.be.a("number");
          return done();
        });
    });

    it("Should return latest purged cache metadata in last 24 hours", function (done) {
      sinon.stub(logsQuery, "fetchCacheLogs").returns(cacheData.cacheModelData);
      chai
        .request(app)
        .get("/cache")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.timeLastCleared).to.be.a("number");

          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .get("/cache")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });
          return done();
        });
    });
  });

  describe("POST /cache", function () {
    before(async function () {
      await cleanDb();
      await addUser(userData[0]);
      const userId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId });
    });

    beforeEach(async function () {
      sinon.stub(cloudflare, "purgeCache").returns(cacheData.purgeCacheResponse[0]);
    });

    afterEach(async function () {
      sinon.restore();
    });

    it("Should purge the cache of member's profile page", function (done) {
      chai
        .request(app)
        .post("/cache")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Cache purged successfully");
          expect(res.body.success).to.equal(true);
          expect(res.body.errors).to.deep.equal([]);
          expect(res.body.messages).to.deep.equal([]);
          expect(res.body.result).to.be.a("object");
          expect(res.body.result.id).to.be.a("string");

          return done();
        });
    });

    it("Should purge the cache by superuser of member's profile page", function (done) {
      chai
        .request(app)
        .post("/cache")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ user: userData[0].username })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Cache purged successfully");
          expect(res.body.success).to.equal(true);
          expect(res.body.errors).to.deep.equal([]);
          expect(res.body.messages).to.deep.equal([]);
          expect(res.body.result).to.be.a("object");
          expect(res.body.result.id).to.be.a("string");

          return done();
        });
    });

    it("Should return username does not exist provided by superUser", function (done) {
      chai
        .request(app)
        .post("/cache")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ user: "username" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal("Please provide a valid username");

          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .post("/cache")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });
          return done();
        });
    });
  });
});
