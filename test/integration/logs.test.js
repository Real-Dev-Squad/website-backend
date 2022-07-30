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
const logData = require("../fixtures/logs/cacheLogs")();

chai.use(chaiHttp);

describe("Logs", function () {
  let jwt;

  after(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("GET /logs/cache/clear", function () {
    before(async function () {
      await cleanDb();
      const userId = await addUser(userData[0]);
      jwt = authService.generateAuthToken({ userId });
    });

    it("Should return empty array if no cache logs in last 24 hours found", function (done) {
      chai
        .request(app)
        .get("/logs/cache/clear")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.count).to.eql(0);
          expect(response.body.logs).to.be.an("array");
          expect(response.body.logs).to.eql([]);
          return done();
        });
    });

    it("Should return cache logs in last 24 hours of a user", function (done) {
      sinon.stub(logsQuery, "fetchMemberCacheLogs").returns(logData);
      chai
        .request(app)
        .get("/logs/cache/clear")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.logs).to.be.an("array");
          expect(response.body.logs[0]).to.be.an("object");
          expect(response.body.logs[0].timestamp).to.be.a("object");
          expect(response.body.logs[0].body).to.be.a("object");
          expect(response.body.logs[0].type).to.be.a("string");
          expect(response.body.logs[0].meta).to.be.a("object");
          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .get("/logs/cache/clear")
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
