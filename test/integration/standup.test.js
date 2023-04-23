const chai = require("chai");
const app = require("../../server");
const addUser = require("../utils/addUser");
const userData = require("../fixtures/user/user")();
const authService = require("../../services/authService");
const cleanDb = require("../utils/cleanDb");
const { object } = require("joi");
const { expect } = chai;

const cookieName = config.get("userToken.cookieName");
const superUser = userData[4];

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("Test standup api", function () {
  let superUserId;
  let superUserAuthToken;
  let jwt;
  let userId = "";
  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("Test the mark api", function () {
    it("Superuser can mark a user as monitored", function (done) {
      chai
        .request(app)
        .post(`/standup/${userId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("User marked for standup successfully.");
          return done();
        });
    });
    it("Should return 401 for other/un-authenticated users", function (done) {
      chai
        .request(app)
        .post(`/standup/${userId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });
    it("Should return 404 for invalid user id", function (done) {
      chai
        .request(app)
        .post(`/standup/123`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a(object);
          return done();
        });
    });
  });
});
