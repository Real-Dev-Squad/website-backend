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
const { addUserStatus } = require("../../models/userStatus");
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
    await addUserStatus(userStsDataForNewUser(userId));
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /userStatus", function () {
    it("Should get all the userStatus in system", function (done) {
      chai
        .request(app)
        .get("/userStatus")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("All User Status found successfully");
          expect(res.body.allUserStatus).to.be.a("array");
          return done();
        });
    });
  });

  describe("GET /userStatus/:userid", function () {
    it("Should return one User Status with the given id", function (done) {
      chai
        .request(app)
        .get(`/userStatus/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully");
          expect(res.body).to.have.property("monthlyHours");
          expect(res.body).to.have.property("currentStatus");
          return done();
        });
    });
  });

  describe("POST /userStatus/:userid", function () {
    let testUserJwt;
    let testUserId;

    beforeEach(async function () {
      await cleanDb();
      testUserId = await addUser();
      testUserJwt = authService.generateAuthToken({ userId: testUserId });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should store the User Status in the collection", function (done) {
      chai
        .request(app)
        .post(`/userStatus/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStsDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully");
          expect(res.body.currentStatus.state).to.equal("OOO");
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .post(`/userStatus/${testUserId}`)
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

    it("Should return 400 for invalid Data", function (done) {
      chai
        .request(app)
        .post(`/userStatus/${testUserId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(invalidUserStsDataforPost)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal(
            '"value" contains [currentStatus] without its required peers [monthlyHours]'
          );
          return done();
        });
    });
  });

  describe("PATCH userStatus/:userid", function () {
    it("Should update the User Status", function (done) {
      chai
        .request(app)
        .patch(`/userStatus/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(validUserStsDataforUpdate)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });

    it("Should return 400 for invalid status value", function (done) {
      chai
        .request(app)
        .patch(`/userStatus/${userId}`)
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

  describe("DELETE userStatus/:userid", function () {
    it("Should return 401 for Unauthorized User", function (done) {
      chai
        .request(app)
        .delete(`/userStatus/${userId}`)
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
        .delete(`/userStatus/${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("UserStatus Deleted successfully.");
          return done();
        });
    });
  });
});
