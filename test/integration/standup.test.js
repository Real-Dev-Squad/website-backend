const chai = require("chai");
const { object } = require("joi");
const { expect } = chai;

const app = require("../../server");

const authService = require("../../services/authService");

const userQuery = require("../../models/users");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const userData = require("../fixtures/user/user")();
const standupData = require("../fixtures/standup/standup");

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
    it("Checks superuser can mark a user as monitored", function (done) {
      chai
        .request(app)
        .post(`/standup/${userId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          monitor: true,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const userData = userQuery.fetchUser({ userId: userId });
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("User marked for standup successfully.");
          expect(userData.roles).to.have.property("monitored");
          expect(userData.roles.monitored).to.be.equal(true);
          return done();
        });
    });
    it("Checks superuser can un-mark a user from monitoring", function (done) {
      chai
        .request(app)
        .post(`/standup/${userId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          monitor: false,
        })
        .end((err, res) => {
          if (err) return done(err);
          const userData = userQuery.fetchUser({ userId: userId });
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("User unmarked for standup successfully.");
          expect(userData.roles).to.have.property("monitored");
          expect(userData.roles.monitored).to.be.equal(false);
          return done();
        });
    });
    it("Should return 401 for other/un-authenticated users", function (done) {
      chai
        .request(app)
        .post(`/standup/${userId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send({
          monitor: true,
        })
        .end((err, res) => {
          if (err) return done(err);
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
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("UserId not found");
          return done();
        });
    });
  });

  describe("Test the get standup Api", function () {
    it("should return the standup of specified user", function (done) {
      chai
        .request(app)
        .get(`/standup/${userId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body).to.include.keys(["yesterday", "today", "blockers", "timestamp"]);
          return done();
        });
    });

    it("should return 404 for user not found", function (done) {
      chai
        .request(app)
        .get("/standup/123")
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("UserId not found");
          return done();
        });
    });
  });

  describe("The save standup API", function () {
    it("Should save standup of the signed in user", function (done) {
      chai
        .request(app)
        .post("/standup")
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(standupData()[0])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.be.equal("Standup data stored successfully.");
          return done();
        });
    });

    it("Should return 400 or invalid body", function (done) {
      chai
        .request(app)
        .post("/standup")
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(standupData()[1])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.be.a(object);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.be.equal(`"timestamp" is required`);
          return done();
        });
    });

    it("Should return 401 for not logged in user", function (done) {
      chai
        .request(app)
        .post("/standup")
        .send(standupData[0])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body).to.be.a(object);
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });
  });
});
