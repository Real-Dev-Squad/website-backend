const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const sinon = require("sinon");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const superUser = userData[4];
const {
  userStatusDataForNewUser,
  userStatusDataForOooState,
  generateUserStatusData,
} = require("../fixtures/userStatus/userStatus");

const config = require("config");
const { updateUserStatus } = require("../../models/userStatus");
const { userState } = require("../../constants/userStatus");
const cookieName = config.get("userToken.cookieName");
const userStatusModel = require("../../models/userStatus");

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
    await updateUserStatus(userId, userStatusDataForNewUser);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /users/status", function () {
    it("Should get all the userStatus in system", function (done) {
      chai
        .request(app)
        .get("/users/status")
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
          res.body.allUserStatus.forEach((status) => {
            expect(status).to.have.property("full_name");
            expect(status).to.have.property("picture");
          });
          return done();
        });
    });

    it("Should return only non-archived idle user status when both archived and non archived users are present in DB", async function () {
      const archivedIdleUserId = await addUser(userData[5]);
      await updateUserStatus(archivedIdleUserId, generateUserStatusData("IDLE", new Date(), new Date()));
      const nonArchivedIdleUserId = await addUser(userData[6]);
      await updateUserStatus(nonArchivedIdleUserId, generateUserStatusData("IDLE", new Date(), new Date()));
      const nonArchivedActiveUserId = await addUser(userData[8]);
      await updateUserStatus(nonArchivedActiveUserId, generateUserStatusData("ACTIVE", new Date(), new Date()));
      const response = await chai.request(app).get("/users/status?state=IDLE");
      expect(response).to.have.status(200);
      expect(response.body.message).to.equal("All User Status found successfully.");
      expect(response.body.totalUserStatus).to.be.a("number");
      expect(response.body.totalUserStatus).to.equal(1);
      expect(response.body.allUserStatus).to.be.a("array");
      expect(response.body.allUserStatus.length).to.equal(1);
    });
  });

  describe("GET /users/status/:userid", function () {
    it("Should return the User Status Document with the given id", function (done) {
      chai
        .request(app)
        .get(`/users/status/${userId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body.data).to.have.property("monthlyHours");
          expect(res.body.data).to.have.property("currentStatus");
          return done();
        });
    });

    it("Should return the User Status Document of the user requesting it", function (done) {
      chai
        .request(app)
        .get(`/users/status/self`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body.data).to.have.property("monthlyHours");
          expect(res.body.data).to.have.property("currentStatus");
          return done();
        });
    });
  });

  describe("PATCH /users/status/update", function () {
    let testUserId;
    let testUserJwt;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date(2022, 10, 12, 12, 0, 0).getTime(),
        toFake: ["Date"],
      });
      testUserId = await addUser(userData[1]);
      testUserJwt = authService.generateAuthToken({ userId: testUserId });
    });

    afterEach(function () {
      clock.restore();
    });

    it("Should return 400 when attempting to set OOO status directly", async function () {
      const updatedAtDate = Date.now();
      const fromDate = updatedAtDate + 12 * 24 * 60 * 60 * 1000;
      const untilDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000;

      const statusData = generateUserStatusData("ACTIVE", updatedAtDate, updatedAtDate);
      statusData.userId = testUserId;
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);

      // Attempting to set OOO status directly should be blocked
      const response = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", updatedAtDate, fromDate, untilDate, "Vacation Trip"));
      expect(response).to.have.status(400);
      expect(response.body.error).to.equal("Bad Request");
      expect(response.body.message).to.equal("Invalid State. the acceptable states are ONBOARDING");
    });
  });

  describe("PATCH /users/status/:userid", function () {
    let testUserId;
    let testUserJwt;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date(2022, 10, 12, 12, 0, 0).getTime(),
        toFake: ["Date"],
      });
      testUserId = await addUser(userData[1]);
      testUserJwt = authService.generateAuthToken({ userId: testUserId });
    });

    afterEach(function () {
      clock.restore();
    });

    it("Should return 400 when attempting to set OOO status directly via :userid endpoint", function (done) {
      chai
        .request(app)
        .patch(`/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal("Invalid State. the acceptable states are ONBOARDING");
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .patch(`/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=""`)
        .send(userStatusDataForOooState)
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

    it("Should return 401 for unauthorized request for user and superuser", function (done) {
      // Using ONBOARDING state since OOO is now blocked by the validator
      // This test verifies authorization, not validation, so we need valid data
      chai
        .request(app)
        .patch(`/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(generateUserStatusData("ONBOARDING", Date.now(), Date.now()))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("You are not authorized to perform this action.");
          return done();
        });
    });

    it("Should return 400 for incorrect state value", function (done) {
      chai
        .request(app)
        .patch(`/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("IN_OFFICE", Date.now(), Date.now()))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(`Invalid State. the acceptable states are ONBOARDING`);
          return done();
        });
    });
  });

  describe("PATCH /users/status/self", function () {
    let userId;
    let userJwt;

    before(async function () {
      userId = await addUser(userData[8]);
      userJwt = authService.generateAuthToken({ userId });
    });

    afterEach(async function () {
      await firestore.collection("tasks").doc("user1AssignedTask").delete();
      await firestore.collection("usersStatus").doc("user1AssignedStatus").delete();
    });

    after(async function () {
      await firestore.collection("users").doc(userId).delete();
    });

    it("Should Change the status to ACTIVE if user has task assigned.", async function () {
      const now = new Date();
      const nowTimeStamp = new Date().setUTCHours(0, 0, 0, 0);
      const fiveDaysFromNowTimeStamp = new Date(now.setUTCHours(0, 0, 0, 0) + 5 * 24 * 60 * 60 * 1000);

      await firestore.collection("tasks").doc("user1AssignedTask").set({
        assignee: userId,
        status: "ASSIGNED",
      });
      await firestore
        .collection("usersStatus")
        .doc("user1AssignedStatus")
        .set({
          userId: userId,
          currentStatus: {
            message: "",
            from: nowTimeStamp,
            until: fiveDaysFromNowTimeStamp,
            updatedAt: nowTimeStamp,
            state: userState.OOO,
          },
        });
      const res = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${userJwt}`)
        .send({ cancelOoo: true });
      expect(res.body.data.currentStatus.state).to.equal(userState.ACTIVE);
      expect(res.body.data.currentStatus.from).to.be.gt(nowTimeStamp);
      expect(res.body.data.currentStatus.until).to.equal("");
      expect(res.body.data.currentStatus.message).to.equal("");
    });

    it("Should Change the status to IDLE if user doesn't have a task assigned.", async function () {
      const now = new Date();
      const nowTimeStamp = new Date().setUTCHours(0, 0, 0, 0);
      const fiveDaysFromNowTimeStamp = new Date(now.setUTCHours(0, 0, 0, 0) + 5 * 24 * 60 * 60 * 1000);

      await firestore
        .collection("usersStatus")
        .doc("user1AssignedStatus")
        .set({
          userId: userId,
          currentStatus: {
            message: "",
            from: nowTimeStamp,
            until: fiveDaysFromNowTimeStamp,
            updatedAt: nowTimeStamp,
            state: userState.OOO,
          },
        });
      const res = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${userJwt}`)
        .send({ cancelOoo: true });
      expect(res.body.data.currentStatus.state).to.equal(userState.IDLE);
      expect(res.body.data.currentStatus.from).to.be.gt(nowTimeStamp);
      expect(res.body.data.currentStatus.until).to.equal("");
      expect(res.body.data.currentStatus.message).to.equal("");
    });

    it("Should throw Not Found when User Status does not exist.", async function () {
      const res = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${userJwt}`)
        .send({ cancelOoo: true });
      expect(res.body.statusCode).to.equal(404);
      expect(res.body.error).to.equal("NotFound");
      expect(res.body.message).to.equal("No User status document found");
    });

    it("Should throw Forbidden when User Status is not OOO.", async function () {
      const nowTimeStamp = new Date().setUTCHours(0, 0, 0, 0);
      await firestore
        .collection("usersStatus")
        .doc("user1AssignedStatus")
        .set({
          userId: userId,
          currentStatus: {
            message: "",
            from: nowTimeStamp,
            until: "",
            updatedAt: nowTimeStamp,
            state: "ACTIVE",
          },
        });
      const res = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${userJwt}`)
        .send({ cancelOoo: true });
      expect(res.body.statusCode).to.equal(403);
      expect(res.body.error).to.equal("Forbidden");
      expect(res.body.message).to.equal("The OOO Status cannot be canceled because the current status is ACTIVE.");
    });

    it("Should throw an error if firestore error", async function () {
      sinon.stub(userStatusModel, "cancelOooStatus").throws(new Error("Firestore error"));
      const res = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${userJwt}`)
        .send({ cancelOoo: true });
      expect(res.body.statusCode).to.equal(500);
      expect(res.body.error).to.equal("Internal Server Error");
      expect(res.body.message).to.equal("An internal server error occurred");
    });
  });

  describe("DELETE user-status/:userid", function () {
    it("Shouldn't delete User Status when the user is Unauthorized", function (done) {
      chai
        .request(app)
        .delete(`/users/status/${userId}`)
        .set("cookie", `${cookieName}=""`)
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

    it("Shouldn't delete User Status if the user doesnt have a superuser role", function (done) {
      chai
        .request(app)
        .delete(`/users/status/${userId}`)
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

    it("Should delete the User Staus if the user has a Super User Role", function (done) {
      chai
        .request(app)
        .delete(`/users/status/${userId}`)
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
