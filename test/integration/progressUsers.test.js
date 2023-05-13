const chai = require("chai");
const sinon = require("sinon");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const {
  standupProgressDay1,
  incompleteProgress,
  stubbedModelProgressData,
} = require("../fixtures/progress/progresses");

const userData = require("../fixtures/user/user")();

const cookieName = config.get("userToken.cookieName");
const { expect } = chai;

// eslint-disable-next-line mocha/no-skipped-tests
describe("Test Progress Updates API for Users", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("Verify POST Request Functionality", function () {
    let clock;
    let userId;
    let userToken;
    let anotherUserId;
    let anotherUserToken;
    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date(2023, 5, 2, 5, 55).getTime(),
        toFake: ["Date"],
      });
      userId = await addUser(userData[1]);
      userToken = authService.generateAuthToken({ userId: userId });
      anotherUserId = await addUser(userData[8]);
      anotherUserToken = authService.generateAuthToken({ userId: anotherUserId });
      const progressData = stubbedModelProgressData(anotherUserId, Date.now(), 1685577600000);
      await firestore.collection("progresses").doc("anotherUserProgressDocument").set(progressData);
      // const progressesDocs = await firestore.collection("progresses").get()
      // const docsData = [];
      // progressesDocs.forEach((doc) => {
      //   docsData.push({ ...doc.data(), id: doc.id });
      // });
    });

    afterEach(function () {
      clock.restore();
    });

    it("stores the user progress document for the first time", function (done) {
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.data).to.have.keys([
            "id",
            "userId",
            "type",
            "completed",
            "planned",
            "blockers",
            "createdAt",
            "date",
          ]);
          expect(res.body.message).to.be.equal("User Progress document created successfully.");
          expect(res.body.data.userId).to.be.equal(userId);
          return done();
        });
    });

    it("throws Conflict Error 409 if the user tries to update progress multiple times in a single day", function (done) {
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${anotherUserToken}`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(409);
          expect(res.body).to.have.key("message");
          expect(res.body.message).to.be.equal("User Progress for the day has already been created.");
          return done();
        });
    });

    it("Gives Bad Request 400 for invalid request body", function (done) {
      const requests = incompleteProgress.map((progress) => {
        return chai
          .request(app)
          .post(`/progresses`)
          .set("Cookie", `${cookieName}=${anotherUserToken}`)
          .send(progress.payload)
          .then((res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.include(`Required field '${progress.missingField}' is missing`);
          });
      });

      Promise.all(requests)
        .then(() => done())
        .catch((err) => done(err));
    });

    it("Gives Unauthenticated Error 401 for unauthenticated user", function (done) {
      chai
        .request(app)
        .post(`/progresses`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });
  });

  describe("Verify GET Request Functionality", function () {
    let userId1;
    let userId2;

    beforeEach(async function () {
      userId1 = await addUser(userData[1]);
      userId2 = await addUser(userData[1]);
      const progressData1 = stubbedModelProgressData(userId1, Date.now(), new Date().setUTCHours(0, 0, 0, 0));
      const progressData2 = stubbedModelProgressData(userId2, Date.now(), new Date().setUTCHours(0, 0, 0, 0));
      await firestore.collection("progresses").doc("progressDoc1").set(progressData1);
      await firestore.collection("progresses").doc("progressDoc2").set(progressData2);
    });

    it("Returns the progress array for a specific user", function (done) {
      chai
        .request(app)
        .get(`/progresses?userId=${userId1}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "type",
              "completed",
              "planned",
              "blockers",
              "userId",
              "createdAt",
              "date",
            ]);
          });
          return done();
        });
    });

    it("Returns the progress array for all the user", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=user`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "type",
              "completed",
              "planned",
              "blockers",
              "userId",
              "createdAt",
              "date",
            ]);
          });
          return done();
        });
    });

    it("Returns 404 for invalid user id", function (done) {
      chai
        .request(app)
        .get(`/progresses?userId=invalidUserId`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("User with id invalidUserId does not exist.");
          return done();
        });
    });
  });

  describe("Verify the missed StandUps", function () {
    let clock;
    let userId;
    beforeEach(async function () {
      const initialTimeStamp = new Date(2023, 5, 2, 6, 30).getTime();
      clock = sinon.useFakeTimers({
        now: initialTimeStamp,
        toFake: ["Date"],
      });
      userId = await addUser(userData[1]);
      const progressData = stubbedModelProgressData(userId, initialTimeStamp, initialTimeStamp);
      await firestore.collection("progresses").doc("testProgressDocument").set(progressData);
    });

    afterEach(function () {
      clock.restore();
    });

    it("verifies the missed standup w.r.t the last update", async function (done) {
      // user misses the update for 2023, 5, 3
      clock.setSystemTime(new Date(2022, 5, 4, 6, 30).getTime());
      await chai
        .request(app)
        .get(`progresses/missed?userId=${userId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.data).to.be.an("object");
          expect(res.body.message).to.be.equal("Missed updates retrieved successfully");
          expect(res.body.data.noOfDays).to.be.equal(1);
          expect(res.body.data.missedDays).to.be.an("array");
          expect(res.body.data.missedDays).to.have.lengthOf(1);
          expect(res.body.data.missedDays[0]).to.be.equal(1683052200000); // missed for 3rd May 2023
          return done();
        });
    });
  });
});
