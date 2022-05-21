const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const flagData = require("../fixtures/flag/flag")();
const superUser = userData[4];
const nonSuperUser = userData[3];

chai.use(chaiHttp);

describe("flags", function () {
  let jwt;
  let nonSuperUserJwt;

  beforeEach(async function () {
    const userId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
    const nonSuperUserId = await addUser(nonSuperUser);
    nonSuperUserJwt = authService.generateAuthToken({ nonSuperUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });
  describe("GET /flag", function () {
    it("Should return all flags", function (done) {
      chai
        .request(app)
        .get("/flag")
        .end((res, err) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Flags returned successfully!");
          expect(res.body.featureFlags).to.be.a("array");

          return done();
        });
    });
    it("Should only authenticate superUser", function (done) {
      chai
        .request(app)
        .get("/flag")
        .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
        .send(flagData)
        .end((err, res) => {
          if (err) {
            throw done(err);
          }
          expect(res.status).to.equal(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal("You are not authorized for this action.");

          return done();
        });
    });
  });
  describe("POST /flag/add", function () {
    it("Should return flag Id", function (done) {
      chai
        .request(app)
        .post("/flag/add")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(flagData)
        .end((err, res) => {
          if (err) {
            throw done(err);
          }
          expect(res.body.flagId).to.be.a("string");
          expect(res.body.message).to.equal("Add feature flag successfully!");

          return done();
        });
    });
    it("Should only authenticate superUser", function (done) {
      chai
        .request(app)
        .post("/flag/add")
        .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
        .send(flagData)
        .end((err, res) => {
          if (err) {
            throw done(err);
          }
          expect(res.status).to.equal(401);
          expect(res.body.error).to.equal("Unauthorized");
          expect(res.body.message).to.equal("You are not authorized for this action.");

          return done();
        });
    });
  });
});
