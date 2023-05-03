const chai = require("chai");
const sinon = require("sinon");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const {
  standupProgressDay1,
  standupProgressDay2,
  incompleteProgress,
  stubbedModelProgressData,
} = require("../fixtures/progress/userProgress");

const userData = require("../fixtures/user/user")();

const cookieName = config.get("userToken.cookieName");
const { expect } = chai;

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("Test Progress Updates API", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("Test the POST Call", function () {
    let clock;
    let testUserId;
    let testUserJwt;
    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date(2023, 5, 2).getTime(),
        toFake: ["Date"],
      });
      testUserId = await addUser(userData[1]);
      testUserJwt = authService.generateAuthToken({ userId: testUserId });
    });

    afterEach(function () {
      clock.restore();
    });

    it("Stores the initial progress entry for the day and disregards any subsequent entries made before 6 am of the next day", async function () {
      const responseFirstDay = await chai
        .request(app)
        .post(`progresses`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(standupProgressDay1);

      expect(responseFirstDay).to.have.status(200);
      expect(responseFirstDay.body).to.have.keys(["message", "data"]);
      expect(responseFirstDay.body.data).to.have.keys([
        "id",
        "userId",
        "type",
        "completed",
        "planned",
        "blockers",
        "createdAt",
        "date",
      ]);
      expect(responseFirstDay.body.message).to.be.equal("Standup progress created successfully");
      expect(responseFirstDay.body.data.userId).to.be.equal(testUserId);

      // subsequent entry made for the same day
      const responseDuplicateEntry = await chai
        .request(app)
        .post(`progresses`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(standupProgressDay2);

      expect(responseDuplicateEntry).to.have.status(400);
      expect(responseDuplicateEntry.body).to.have.keys(["message", "error"]);
      expect(responseDuplicateEntry.body.error).to.be.equal("Standup entry already exists for the day");
      expect(responseDuplicateEntry.body.message).to.be.equal("You can only add one standup entry per day");

      // entry for the next day before 6 am
      clock.setSystemTime(new Date(2022, 5, 3).getTime());

      const responseFirstNextDayEntry = await chai
        .request(app)
        .post(`progresses`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(standupProgressDay2);

      expect(responseFirstNextDayEntry).to.have.status(400);
      expect(responseFirstNextDayEntry.body).to.have.keys(["message", "error"]);
      expect(responseFirstNextDayEntry.body.error).to.be.equal("Standup entry already exists for the day");
      expect(responseFirstNextDayEntry.body.message).to.be.equal("You can only add one standup entry per day");

      // entry for the next day after 6 am
      clock.setSystemTime(new Date(2022, 5, 3, 6, 30).getTime());

      const responseSecondNextDayEntry = await chai
        .request(app)
        .post(`progresses`)
        .set("Cookie", `${cookieName}=${testUserJwt}`)
        .send(standupProgressDay2);
      expect(responseSecondNextDayEntry).to.have.status(200);
      expect(responseSecondNextDayEntry.body).to.have.keys(["message", "data"]);
      expect(responseSecondNextDayEntry.body.data).to.have.keys([
        "id",
        "userId",
        "type",
        "completed",
        "planned",
        "blockers",
        "createdAt",
        "date",
      ]);
      expect(responseSecondNextDayEntry.body.message).to.be.equal("Standup progress created successfully");
      expect(responseSecondNextDayEntry.body.data.userId).to.be.equal(testUserId);
    });

    it("Gives 400 for invalid request body", function (done) {
      const requests = incompleteProgress.map((progress) => {
        return chai
          .request(app)
          .post(`progresses`)
          .set("Cookie", `${cookieName}=${testUserJwt}`)
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

    it("Gives 401 for unauthenticated user", function (done) {
      chai
        .request(app)
        .post(`progresses`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Access denied: User authentication is required");
          return done();
        });
    });
  });

  describe("Test the GET Call", function () {
    let testUserId;

    beforeEach(async function () {
      testUserId = await addUser(userData[1]);
      const progressData = stubbedModelProgressData(testUserId, Date.now(), Date.now());
      await firestore.collection("progresses").doc("testProgressDocument").set(progressData);
    });

    it("Returns the progress array for the user", function (done) {
      chai
        .request(app)
        .get(`/progresses?userId=${testUserId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress data retrieved successfully");
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys(["type", "completed", "planned", "blockers", "userId", "createdAt", "date"]);
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
          expect(res.body.message).to.be.equal("UserId couldn't be retrieved");
          return done();
        });
    });
  });
});
