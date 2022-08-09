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

const userData = require("../fixtures/user/user")();
const cacheData = require("../fixtures/logs/cacheLogs");

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
      sinon.stub(logsQuery, "fetchLastAddedCacheLog").returns(cacheData.cacheModelMetaData);
      chai
        .request(app)
        .get("/caches")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.id).to.be.a("string");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.timestamp).to.be.a("number");
          return done();
        });
    });

    it("Should return latest purged cache metadata in last 24 hours", function (done) {
      sinon.stub(logsQuery, "fetchCacheLogs").returns(cacheData.cacheModelMetaData);
      chai
        .request(app)
        .get("/caches")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.id).to.be.a("string");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.timestamp).to.be.a("number");

          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .get("/caches ")
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
