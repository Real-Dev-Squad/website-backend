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
  oooStatusDataForShortDuration,
  generateUserStatusData,
} = require("../fixtures/userStatus/userStatus");

const config = require("config");
const { updateUserStatus } = require("../../models/userStatus");
const { userState } = require("../../constants/userStatus");
const cookieName = config.get("userToken.cookieName");
const userStatusModel = require("../../models/userStatus");
const { convertTimestampToUTCStartOrEndOfDay } = require("../../utils/time");

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

    it("Should update the User Status based on the future dates", async function () {
      // creating Active Status from 12th Nov 2022 (1669401000000)
      const updatedAtDate = Date.now(); // 12th Nov 2022
      const fromDate = updatedAtDate + 12 * 24 * 60 * 60 * 1000; // 24th Nov 2022
      const fromDateInUTC = convertTimestampToUTCStartOrEndOfDay(fromDate, false);
      const untilDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000; // 28th Nov 2022
      const untilDateInUTC = convertTimestampToUTCStartOrEndOfDay(untilDate, true);

      const statusData = generateUserStatusData("ACTIVE", updatedAtDate, updatedAtDate);
      statusData.userId = testUserId;
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);

      // Marking OOO Status from 24th Nov 2022 to 28th Nov 2022
      const response2 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", updatedAtDate, fromDate, untilDate, "Vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("User Status updated successfully.");
      expect(response2.body.data).to.have.own.property("futureStatus");
      expect(response2.body.data.futureStatus.state).to.equal("OOO");
      expect(response2.body.data.futureStatus.message).to.equal("Vacation Trip");
      expect(response2.body.data.futureStatus.from).to.equal(fromDateInUTC);
      expect(response2.body.data.futureStatus.until).to.equal(untilDateInUTC);
      expect(response2.body.data.futureStatus.updatedAt).to.equal(updatedAtDate);

      // Mocking date to be 26th Nov 2022
      clock.setSystemTime(new Date(2022, 10, 26).getTime());

      // Calling the users/status/update API to update the status
      const response3 = await chai
        .request(app)
        .patch(`/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response3).to.have.status(200);
      expect(response3.body.message).to.equal("All User Status updated successfully.");
      expect(response3.body.data).to.deep.equal({
        usersCount: 1,
        oooUsersAltered: 0,
        oooUsersUnaltered: 0,
        nonOooUsersAltered: 1,
        nonOooUsersUnaltered: 0,
      });

      // Checking the current status
      const response4 = await chai.request(app).get(`/users/status/self`).set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response4).to.have.status(200);
      expect(response4.body).to.be.a("object");
      expect(response4.body.message).to.equal("User Status found successfully.");
      expect(response4.body.data).to.have.property("currentStatus");
      expect(response4.body.data.currentStatus.state).to.equal("OOO");
      expect(response4.body.data).to.have.property("futureStatus");
      expect(response4.body.data.futureStatus.state).to.equal("ACTIVE");

      clock.setSystemTime(new Date(2022, 10, 30).getTime());

      const response5 = await chai
        .request(app)
        .patch(`/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response5).to.have.status(200);
      expect(response5.body.message).to.equal("All User Status updated successfully.");
      expect(response5.body.data).to.deep.equal({
        usersCount: 1,
        oooUsersAltered: 1,
        oooUsersUnaltered: 0,
        nonOooUsersAltered: 0,
        nonOooUsersUnaltered: 0,
      });

      const response6 = await chai.request(app).get(`/users/status/self`).set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response6).to.have.status(200);
      expect(response6.body).to.be.a("object");
      expect(response6.body.message).to.equal("User Status found successfully.");
      expect(response6.body.data).to.have.property("currentStatus");
      expect(response6.body.data.currentStatus.state).to.equal("ACTIVE");
    });

    it("Should clear the future active/idle Status if during ooo period user mark themselves idle/active", async function () {
      // creating Active Status from 12th Nov 2022
      const updatedAtDate = Date.now(); // 12th Nov 2022
      const fromDate = updatedAtDate + 12 * 24 * 60 * 60 * 1000; // 24th Nov 2022
      const untilDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000; // 28th Nov 2022

      const statusData = generateUserStatusData("ACTIVE", updatedAtDate, updatedAtDate);
      statusData.userId = testUserId;
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);

      // Marking OOO Status from 24th Nov 2022 to 28th Nov 2022
      const response2 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", updatedAtDate, fromDate, untilDate, "Vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("User Status updated successfully.");
      expect(response2.body.data).to.have.own.property("futureStatus");
      expect(response2.body.data.futureStatus.state).to.equal("OOO");

      // Mocking date to be 26th Nov 2022
      clock.setSystemTime(new Date(2022, 10, 26).getTime());

      // Calling the users/status/update API to update the status
      const response3 = await chai
        .request(app)
        .patch(`/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response3).to.have.status(200);
      expect(response3.body.message).to.equal("All User Status updated successfully.");
      expect(response3.body.data).to.deep.equal({
        usersCount: 1,
        oooUsersAltered: 0,
        oooUsersUnaltered: 0,
        nonOooUsersAltered: 1,
        nonOooUsersUnaltered: 0,
      });

      // Checking the current status
      const response4 = await chai.request(app).get(`/users/status/self`).set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response4).to.have.status(200);
      expect(response4.body).to.be.a("object");
      expect(response4.body.message).to.equal("User Status found successfully.");
      expect(response4.body.data).to.have.property("currentStatus");
      expect(response4.body.data.currentStatus.state).to.equal("OOO");
      expect(response4.body.data).to.have.property("futureStatus");
      expect(response4.body.data.futureStatus.state).to.equal("ACTIVE");
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

    it("Should store the User Status in the collection", function (done) {
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully.");
          expect(res.body.data.currentStatus.state).to.equal("OOO");
          return done();
        });
    });

    it("Should store the User Status in the collection when requested by Super User", function (done) {
      chai
        .request(app)
        .patch(`/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully.");
          expect(res.body.data.currentStatus.state).to.equal("OOO");
          return done();
        });
    });

    // Skipping this as the users are not allowed to mark them as active or idle. Will remove the test while removing the feature flag.
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("Should update the User Status", function (done) {
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(generateUserStatusData("ACTIVE", Date.now(), Date.now()))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("User Status updated successfully.");
          return done();
        });
    });

    it("Should update the User Status without reason for short duration", function (done) {
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(oooStatusDataForShortDuration)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("User Status updated successfully.");
          return done();
        });
    });

    // Skipping this as the users are not allowed to mark them as active or idle. Will remove the test while removing the feature flag.
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("Should update the User Status when requested by Super User", function (done) {
      chai
        .request(app)
        .patch(`/users/status/${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(generateUserStatusData("ACTIVE", Date.now(), Date.now()))
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

    it("Should return 400 for incorrect state value", function (done) {
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("IN_OFFICE", Date.now(), Date.now()))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(`Invalid State. the acceptable states are OOO,ONBOARDING`);
          return done();
        });
    });

    it("Should return error when trying to change OOO without reason for more than 3 days period", function (done) {
      // marking OOO from 18 Nov 2022 (1668709800000) to 23 Nov 2022 (1669141800000)
      const untilDate = Date.now() + 4 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), Date.now(), untilDate, ""))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(
            `The value for the 'message' field is mandatory when State is OOO for more than three days.`
          );
          return done();
        });
    });

    it("Should return error when trying to update status for a past date", function (done) {
      // marking ACTIVE from last 4 days
      const fromDate = Date.now() - 4 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, "", ""))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(
            `The 'from' field must have a value that is either today or a date that follows today.`
          );
          return done();
        });
    });

    it("Should return error when trying to mark 000 with until field having value less then from field", function (done) {
      // marking ACTIVE from last 4 days
      const fromDate = Date.now() + 10 * 24 * 60 * 60 * 1000;
      const untilDate = Date.now() + 5 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/users/status/self`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, untilDate, "Semester Exams"))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(
            `The 'until' field must have a value that is either 'from' date or a date that comes after 'from' day.`
          );
          return done();
        });
    });

    it("should replace old future OOO Status with new future OOO Status", async function () {
      const updatedAtDate = Date.now();
      const statusData = generateUserStatusData("ACTIVE", updatedAtDate, updatedAtDate);
      statusData.userId = testUserId;
      await firestore.collection("usersStatus").doc("userStatus").set(statusData);

      // Initially Marking OOO Status from 24th Nov 2022 to 28th Nov 2022
      let fromDate = new Date(2022, 10, 24).getTime();
      let fromDateInUTC = convertTimestampToUTCStartOrEndOfDay(fromDate, false);
      let untilDate = new Date(2022, 10, 28).getTime();
      let untilDateInUTC = convertTimestampToUTCStartOrEndOfDay(untilDate, true);
      const response2 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, untilDate, "Vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("User Status updated successfully.");
      expect(response2.body.data).to.have.own.property("futureStatus");
      expect(response2.body.data.futureStatus.state).to.equal("OOO");
      expect(response2.body.data.futureStatus.from).to.equal(fromDateInUTC); // 24th Nov 2022
      expect(response2.body.data.futureStatus.until).to.equal(untilDateInUTC); // 28th Nov 2022

      // Changing OOO status again from 1st Dec 2022 to 5th Dec 2022
      fromDate = new Date(2022, 11, 1).getTime();
      untilDate = new Date(2022, 11, 5).getTime();
      fromDateInUTC = convertTimestampToUTCStartOrEndOfDay(fromDate, false);
      untilDateInUTC = convertTimestampToUTCStartOrEndOfDay(untilDate, true);
      const response3 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, untilDate, "New plan for vacation Trip"));
      expect(response3).to.have.status(200);
      expect(response3.body.message).to.equal("User Status updated successfully.");
      expect(response3.body.data).to.have.own.property("futureStatus");
      expect(response3.body.data.futureStatus.state).to.equal("OOO");
      expect(response3.body.data.futureStatus.from).to.equal(fromDateInUTC); // 1st Dec 2022
      expect(response3.body.data.futureStatus.until).to.equal(untilDateInUTC); // 5th Dec 2022

      // Checking the current status
      const response4 = await chai.request(app).get(`/users/status/self`).set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response4).to.have.status(200);
      expect(response4.body).to.be.a("object");
      expect(response4.body.message).to.equal("User Status found successfully.");
      expect(response4.body.data).to.have.property("currentStatus");
      expect(response4.body.data.currentStatus.state).to.equal("ACTIVE");
      expect(response4.body.data).to.have.property("futureStatus");
      expect(response4.body.data.futureStatus.state).to.equal("OOO");
      expect(response3.body.data.futureStatus.from).to.equal(fromDateInUTC); // 1st Dec 2022
      expect(response3.body.data.futureStatus.until).to.equal(untilDateInUTC); // 5th Dec 2022
    });

    it("should clear future OOO Status if current Status is marked as OOO", async function () {
      // Initially Marking OOO Status from 24th Nov 2022 to 28th Nov 2022.
      let fromDate = new Date(2022, 10, 24).getTime(); // 24th Nov 2022
      let untilDate = new Date(2022, 10, 28).getTime(); // 28th Nov 2022
      let fromDateInUTC = convertTimestampToUTCStartOrEndOfDay(fromDate, false);
      let untilDateInUTC = convertTimestampToUTCStartOrEndOfDay(untilDate, true);
      const response1 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, untilDate, "Vacation Trip"));
      expect(response1).to.have.status(201);
      expect(response1.body.message).to.equal("User Status created successfully.");
      expect(response1.body.data).to.have.own.property("futureStatus");
      expect(response1.body.data.futureStatus.state).to.equal("OOO");
      expect(response1.body.data.futureStatus.from).to.equal(fromDateInUTC); // 24th Nov 2022
      expect(response1.body.data.futureStatus.until).to.equal(untilDateInUTC); // 28th Nov 2022

      // Changing OOO status from today
      fromDate = new Date(2022, 10, 12, 12, 0, 0).getTime(); // 17th Nov 2022
      untilDate = new Date(2022, 10, 17, 12, 0, 0).getTime(); // 17th Nov 2022
      fromDateInUTC = convertTimestampToUTCStartOrEndOfDay(fromDate, false);
      untilDateInUTC = convertTimestampToUTCStartOrEndOfDay(untilDate, true);
      const response2 = await chai
        .request(app)
        .patch(`/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), fromDate, untilDate, "Changed plan for vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("User Status updated successfully.");
      expect(response2.body.data).to.have.own.property("currentStatus");
      expect(response2.body.data.currentStatus.state).to.equal("OOO");
      expect(response2.body.data.currentStatus.from).to.equal(fromDateInUTC); // 12 Nov 2022
      expect(response2.body.data.currentStatus.until).to.equal(untilDateInUTC); // 17 Nov 2022
      expect(response2.body.data.futureStatus.state).to.equal(undefined);
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
