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
const {
  userStatusDataForNewUser,
  generateUserStatusData,
  userStatusDataForOooState,
  oooStatusDataForShortDuration,
} = require("../fixtures/usersStatus/usersStatus");
const userData = require("../fixtures/user/user")();
const superUser = userData[4];

const { convertTimestampToUTCStartOrEndOfDay } = require("../../utils/time");

const config = require("config");
const { updateUserStatus } = require("../../models/usersStatus");

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
    await updateUserStatus(userId, userStatusDataForNewUser);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /v1/users/status/:userid", function () {
    it("Should return the User Status Document with the given id", function (done) {
      chai
        .request(app)
        .get(`/v1/users/status/${userId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body.data.state).to.equal("CURRENT");
          return done();
        });
    });

    it("Should not return the User Status Document of the user requesting it", function (done) {
      chai
        .request(app)
        .get(`/v1/users/status/self`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status couldn't be found.");
          expect(res.body.userId).to.equal("self");
          expect(res.body.data).to.equal(null);
          return done();
        });
    });
  });

  describe("PATCH /v1/users/status/update", function () {
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
      const appliedOnDate = updatedAtDate + 12 * 24 * 60 * 60 * 1000; // 24th Nov 2022
      const appliedOnDateInUTC = convertTimestampToUTCStartOrEndOfDay(appliedOnDate, false);
      const endsOnDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000; // 28th Nov 2022
      const endsOnDateInUTC = convertTimestampToUTCStartOrEndOfDay(endsOnDate, true);

      const statusData = generateUserStatusData("ACTIVE", updatedAtDate);
      statusData.userId = testUserId;
      await firestore
        .collection("userStatus")
        .doc("userStatus")
        .set({ state: "CURRENT", ...statusData });

      // Marking OOO Status from 24th Nov 2022 to 28th Nov 2022
      const response2 = await chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", appliedOnDate, endsOnDate, "Vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("Future Status of user updated successfully.");
      expect(response2.body.data.state).to.equal("UPCOMING");
      expect(response2.body.data.status).to.equal("OOO");
      expect(response2.body.data.message).to.equal("Vacation Trip");
      expect(response2.body.data.from).to.equal(appliedOnDateInUTC);
      expect(response2.body.data.endsOn).to.equal(endsOnDateInUTC);

      // // Mocking date to be 26th Nov 2022
      clock.setSystemTime(new Date(2022, 10, 26).getTime());

      // // Calling the users/status/update API to update the status
      const response3 = await chai
        .request(app)
        .patch(`/v1/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response3).to.have.status(200);
      expect(response3.body.message).to.equal("All User Status updated successfully.");
      expect(response3.body.data).to.deep.equal({
        noOfUserStatusUpdated: 1,
        oooUsersAltered: 0,
        nonOooUsersAltered: 1,
        futureStatusLeft: 0,
      });

      // // Checking the current status
      const response4 = await chai
        .request(app)
        .get(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response4).to.have.status(200);
      expect(response4.body).to.be.a("object");
      expect(response4.body.message).to.equal("User Status found successfully.");
      expect(response4.body.data.state).to.equal("CURRENT");
      expect(response4.body.data.status).to.equal("OOO");

      clock.setSystemTime(new Date(2022, 10, 30).getTime());

      const response5 = await chai
        .request(app)
        .patch(`/v1/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response5).to.have.status(200);
      expect(response5.body.message).to.equal("All User Status updated successfully.");
      expect(response5.body.data).to.deep.equal({
        noOfUserStatusUpdated: 1,
        oooUsersAltered: 1,
        nonOooUsersAltered: 0,
        futureStatusLeft: 0,
      });

      const response6 = await chai
        .request(app)
        .get(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response6).to.have.status(200);
      expect(response6.body).to.be.a("object");
      expect(response6.body.message).to.equal("User Status found successfully.");
      expect(response6.body.data.state).to.equal("CURRENT");
      expect(response6.body.data.status).to.equal("ACTIVE");
    });

    it("Should clear the future active/idle Status if during ooo period user mark themselves idle/active", async function () {
      // creating Active Status from 12th Nov 2022
      const updatedAtDate = Date.now(); // 12th Nov 2022
      const appliedOnDate = updatedAtDate + 12 * 24 * 60 * 60 * 1000; // 24th Nov 2022
      const endsOnDate = updatedAtDate + 16 * 24 * 60 * 60 * 1000; // 28th Nov 2022

      const statusData = generateUserStatusData("ACTIVE", updatedAtDate);
      statusData.userId = testUserId;
      await firestore
        .collection("userStatus")
        .doc("userStatus")
        .set({ state: "CURRENT", ...statusData });

      // Marking OOO Status from 24th Nov 2022 to 28th Nov 2022
      const response2 = await chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", appliedOnDate, endsOnDate, "Vacation Trip"));
      expect(response2).to.have.status(200);
      expect(response2.body.message).to.equal("Future Status of user updated successfully.");
      expect(response2.body.data.state).to.equal("UPCOMING");
      expect(response2.body.data.status).to.equal("OOO");

      // Mocking date to be 26th Nov 2022
      clock.setSystemTime(new Date(2022, 10, 26).getTime());

      // Calling the users/status/update API to update the status
      const response3 = await chai
        .request(app)
        .patch(`/v1/users/status/update`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send();
      expect(response3).to.have.status(200);
      expect(response3.body.message).to.equal("All User Status updated successfully.");
      expect(response3.body.data).to.deep.equal({
        noOfUserStatusUpdated: 1,
        oooUsersAltered: 0,
        nonOooUsersAltered: 1,
        futureStatusLeft: 0,
      });

      // Checking the current status
      const response4 = await chai
        .request(app)
        .get(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`);
      expect(response4).to.have.status(200);
      expect(response4.body).to.be.a("object");
      expect(response4.body.message).to.equal("User Status found successfully.");
      expect(response4.body.data.state).to.equal("CURRENT");
      expect(response4.body.data.status).to.equal("OOO");
    });
  });

  describe("PATCH /v1/users/status/:userid", function () {
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

    it("Should not store the User Status in the collection if self is passed as id", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/self`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(403);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthorized User");
          return done();
        });
    });

    it("Should store the User Status in the collection when requested by User", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully.");
          expect(res.body.data.status).to.equal("OOO");
          return done();
        });
    });

    it("Should store the User Status in the collection when requested by Super User", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send(userStatusDataForOooState)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status created successfully.");
          expect(res.body.data.status).to.equal("OOO");
          return done();
        });
    });

    it("Should update the User Status without reason for short duration", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(oooStatusDataForShortDuration)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Future Status of user updated successfully.");
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
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

    it("Should return 400 for incorrect status value", function (done) {
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("IN_OFFICE", Date.now()))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(`Invalid Status. the acceptable statuses are OOO,ONBOARDING`);
          return done();
        });
    });

    it("Should return error when trying to change OOO without reason for more than 3 days period", function (done) {
      // marking OOO from 18 Nov 2022 (1668709800000) to 23 Nov 2022 (1669141800000)
      const endsOnDate = Date.now() + 4 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", Date.now(), endsOnDate, ""))
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
      const appliedOnDate = Date.now() - 4 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", appliedOnDate, "", ""))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(
            `The 'appliedOn' field must have a value that is either today or a date that follows today.`
          );
          return done();
        });
    });

    it("Should return error when trying to mark 000 with endsOn field having value less then appliedOn field", function (done) {
      // marking ACTIVE from last 4 days
      const appliedOnDate = Date.now() + 10 * 24 * 60 * 60 * 1000;
      const endsOnDate = Date.now() + 5 * 24 * 60 * 60 * 1000;
      chai
        .request(app)
        .patch(`/v1/users/status/${testUserId}`)
        .set("cookie", `${cookieName}=${testUserJwt}`)
        .send(generateUserStatusData("OOO", appliedOnDate, endsOnDate, "Semester Exams"))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal(`Bad Request`);
          expect(res.body.message).to.equal(
            `The 'endsOn' field must have a value that is either 'appliedOn' date or a date that comes after 'appliedOn' day.`
          );
          return done();
        });
    });
  });
});
