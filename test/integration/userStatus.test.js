const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const superUser = userData[4];
const {
  userStsDataForNewUser,
  userStsDataForOooState,
  invalidUserStsDataforPost,
  validUserStsDataforUpdate,
  invalidUserStsDataforUpdate,
} = require("../fixtures/userStatus/userStatus");

const config = require("config");
const { updateUserStatus } = require("../../models/userStatus");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("UserStatus", function () {
  let jwt;
  let superUserId;
  let superUserAuthToken;
  let userId = "";

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    await updateUserStatus(userId, userStsDataForNewUser);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /user-status", function () {
    it("Should get all the userStatus in system", function (done) {
      chai
        .request(app)
        .get("/user-status")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.totalUserStatus).to.be.a("number");
          expect(res.body.message).to.equal("All User Status found successfully.");
          expect(res.body.allUserStatus).to.be.a("array");
          return done();
        });
    });
  });

  describe("GET /user-status/:userid", function () {
    it("Should return one User Status with the given id", function (done) {
      chai
        .request(app)
        .get(`/user-status/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body).to.have.property("monthlyHours");
          expect(res.body).to.have.property("currentStatus");
          return done();
        });
    });
  });

  describe("PATCH user-status/:userid", function () {
    let testUserId;
    let testUserJwt;

    beforeEach(async function () {
      testUserId = await addUser(userData[1]);
      testUserJwt = authService.generateAuthToken({ userId: testUserId });
    });

    it("Should store the User Status in the collection", function (done) {
      chai
        .request(app)
        .patch(`/user-status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStsDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully.");
          expect(res.body.currentStatus.state).to.equal("OOO");
          return done();
        });
    });

    it("Should update the User Status", function (done) {
      chai
        .request(app)
        .patch(`/user-status/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(validUserStsDataforUpdate)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("User Status updated successfully.");
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .patch(`/user-status/${testUserId}`)
        .set("Cookie", `${cookieName}=""`)
        .send(userStsDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });

    it("Should return 400 for invalid Data for a new User Status", function (done) {
      chai
        .request(app)
        .patch(`/user-status/${testUserId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(invalidUserStsDataforPost)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("User Status couldn't be created due to incomplete request body.");
          return done();
        });
    });

    it("Should return 400 for incorrect state value", function (done) {
      chai
        .request(app)
        .patch(`/user-status/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(invalidUserStsDataforUpdate)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 400,
            error: "Bad Request",
            message: '"currentStatus.state" must be one of [IDLE, ACTIVE, OOO]',
          });
          return done();
        });
    });
  });

  describe("DELETE user-status/:userid", function () {
    it("Should return 401 for Unauthorized User", function (done) {
      chai
        .request(app)
        .delete(`/user-status/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "You are not authorized for this action.",
          });
          return done();
        });
    });

    it("Should return 200 for deletion by Super User", function (done) {
      chai
        .request(app)
        .delete(`/user-status/${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("User Status deleted successfully.");
          return done();
        });
    });
  });
});
