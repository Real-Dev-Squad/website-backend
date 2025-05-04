import chai from "chai";
import sinon from "sinon";
import config from "config";

import firestore from "../../utils/firestore.js";
import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import progressesModel from "../../models/progresses.js";
import addUser from "../utils/addUser.js";
import cleanDb from "../utils/cleanDb.js";
import { standupProgressDay1, incompleteProgress, stubbedModelProgressData } from "../fixtures/progress/progresses.js";

import userData from "../fixtures/user/user.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../../constants/progresses.js";
const cookieName = config.get("userToken.cookieName");
const { expect } = chai;

describe("Test Progress Updates API for Users", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("Verify the POST progress records", function () {
    let clock;
    let userId;
    let userToken;
    let anotherUserId;
    let anotherUserToken;
    let fetchMock;

    beforeEach(async function () {
      fetchMock = sinon.stub(global, "fetch");
      clock = sinon.useFakeTimers({
        now: new Date(Date.UTC(2023, 4, 2, 0, 25)).getTime(), // UTC time equivalent to 5:55 AM IST
        toFake: ["Date"],
      });
      userId = await addUser(userData[1]);
      userToken = generateAuthToken({ userId: userId });
      anotherUserId = await addUser(userData[8]);
      anotherUserToken = generateAuthToken({ userId: anotherUserId });
      const progressData = stubbedModelProgressData(anotherUserId, 1682935200000, 1682899200000);
      await firestore.collection("progresses").doc("anotherUserProgressDocument").set(progressData);
    });

    afterEach(function () {
      sinon.restore();
      clock.restore();
    });

    it("stores the user progress document", function (done) {
      fetchMock.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({}),
        })
      );
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

    it("stores the user progress document for the previous day if the update is sent before 6am IST", function (done) {
      clock.setSystemTime(new Date(Date.UTC(2023, 4, 2, 0, 29)).getTime()); // 2nd May 2023 05:59 am IST
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body.data.date).to.be.equal(1682899200000); // 1st May 2023
          return done();
        });
    });

    it("stores the user progress document for the current day if the update is sent after 6am IST", function (done) {
      clock.setSystemTime(new Date(Date.UTC(2023, 4, 2, 0, 31)).getTime()); // 2nd May 2023 06:01 am IST
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(standupProgressDay1)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body.data.date).to.be.equal(1682985600000); // 2nd May 2023
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

  describe("Verify the GET progress records", function () {
    let userId1;
    let userId2;
    let userId3;

    beforeEach(async function () {
      userId1 = await addUser(userData[0]);
      userId2 = await addUser(userData[1]);
      userId3 = await addUser(userData[2]);
      const progressData1 = stubbedModelProgressData(userId1, 1683957764140, 1683936000000);
      const progressData2 = stubbedModelProgressData(userId2, 1683957764140, 1683936000000);
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
              "userData",
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
              "userData",
              "createdAt",
              "date",
            ]);
          });
          return done();
        });
    });

    it("Returns 400 for bad request", function (done) {
      chai
        .request(app)
        .get(`/progresses`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal('"value" must contain at least one of [type, userId, taskId]');
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

    it("Returns 404 if the progress document doesn't exist for the users", function (done) {
      chai
        .request(app)
        .get(`/progresses?userId=${userId3}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("No progress records found.");
          return done();
        });
    });
  });

  describe("Verify the GET date range progress records", function () {
    let userId;
    let userId2;

    beforeEach(async function () {
      userId = await addUser(userData[1]);
      userId2 = await addUser(userData[2]);
      const progressData1 = stubbedModelProgressData(userId, 1683626400000, 1683590400000); // 2023-05-09
      const progressData2 = stubbedModelProgressData(userId, 1683885600000, 1683849600000); // 2023-05-12
      await firestore.collection("progresses").doc("progressDoc1").set(progressData1);
      await firestore.collection("progresses").doc("progressDoc2").set(progressData2);
    });

    it("Verifies the progress records for a user within the specified date range.", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?userId=${userId}&startDate=2023-05-09&endDate=2023-05-12`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("object");
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.data).to.have.keys(["startDate", "endDate", "progressRecords"]);
          expect(res.body.data.startDate).to.be.equal("2023-05-09");
          expect(res.body.data.endDate).to.be.equal("2023-05-12");
          expect(res.body.data.progressRecords).to.have.key(["2023-05-09", "2023-05-10", "2023-05-11", "2023-05-12"]);
          expect(res.body.data.progressRecords["2023-05-09"]).to.be.equal(true);
          expect(res.body.data.progressRecords["2023-05-10"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-11"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-12"]).to.be.equal(true);
          return done();
        });
    });

    it("Returns 400 for bad request", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?userId=${userId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Start date and End date is mandatory.");
          return done();
        });
    });

    it("Returns 404 for invalid user id", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?userId=invalidUserId&startDate=2023-05-09&endDate=2023-05-12`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("User with id invalidUserId does not exist.");
          return done();
        });
    });

    it("Returns 404 if the progress document doesn't exist", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?userId=${userId2}&startDate=2023-05-09&endDate=2023-05-12`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("No progress records found.");
          return done();
        });
    });
  });

  describe("Verify the GET endpoint for retrieving progress document for the user on a particular date", function () {
    let userId;
    let anotherUserId;

    beforeEach(async function () {
      userId = await addUser(userData[0]);
      anotherUserId = await addUser(userData[1]);
      const progressData = stubbedModelProgressData(userId, 1683072000000, 1682985600000);
      await firestore.collection("progresses").doc("progressDoc").set(progressData);
    });

    it("Returns the progress data for a specific user", function (done) {
      chai
        .request(app)
        .get(`/progresses/user/${userId}/date/2023-05-02`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.data).to.be.an("object");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.data).to.have.keys([
            "id",
            "type",
            "completed",
            "planned",
            "blockers",
            "userId",
            "createdAt",
            "date",
          ]);
          return done();
        });
    });

    it("Should return 404 No progress records found if the document doesn't exist", function (done) {
      chai
        .request(app)
        .get(`/progresses/user/${userId}/date/2023-05-03`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.key("message");
          expect(res.body.message).to.be.equal("No progress records found.");
          return done();
        });
    });

    it("Returns 400 for bad request", function (done) {
      chai
        .request(app)
        .get(`/progresses/user/${userId}/date/2023-05-33`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal('"date" must be in ISO 8601 date format');
          return done();
        });
    });

    it("Returns 404 for invalid user id", function (done) {
      chai
        .request(app)
        .get(`/progresses/user/invalidUserId/date/2023-05-02`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("User with id invalidUserId does not exist.");
          return done();
        });
    });

    it("Returns 404 if the progress document doesn't exist for the user", function (done) {
      chai
        .request(app)
        .get(`/progresses/user/${anotherUserId}/date/2023-05-02`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("No progress records found.");
          return done();
        });
    });
  });

  describe("GET /progresses (getPaginatedProgressDocument)", function () {
    beforeEach(async function () {
      const userId1 = await addUser(userData[0]);
      const userId2 = await addUser(userData[1]);
      const progressData1 = stubbedModelProgressData(userId1, 1683957764140, 1683936000000);
      const progressData2 = stubbedModelProgressData(userId2, 1683957764140, 1683936000000);
      await firestore.collection("progresses").doc("progressDoc1").set(progressData1);
      await firestore.collection("progresses").doc("progressDoc2").set(progressData2);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should return paginated results when dev=true is passed", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=user&dev=true&page=0&size=1`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count", "links"]);
          expect(res.body.links).to.have.keys(["next", "prev"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.count).to.be.equal(1);
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "type",
              "completed",
              "planned",
              "blockers",
              "userData",
              "userId",
              "createdAt",
              "date",
            ]);
          });

          return done();
        });
    });

    it("should return null for next link on the last page", function (done) {
      const size = 1;
      const page = 1;

      chai
        .request(app)
        .get(`/progresses?type=user&dev=true&page=${page}&size=${size}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count", "links"]);
          expect(res.body.links).to.have.keys(["next", "prev"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.links.next).to.be.equal(null);
          expect(res.body.links.prev).to.equal(`/progresses?type=user&page=${page - 1}&size=${size}&dev=true`);
          return done();
        });
    });

    it("should return a bad request error for invalid size parameter", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=user&dev=true&page=0&size=104`)
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("size must be in the range 1-100");
          return done();
        });
    });

    it("should return an empty array of progresses data on a page with no data", function (done) {
      const size = 10;
      const page = 100;

      chai
        .request(app)
        .get(`/progresses?type=user&dev=true&page=${page}&size=${size}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Progress document retrieved successfully.");
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.data).to.be.an("array").that.is.empty;
          expect(res.body.links).to.have.keys(["next", "prev"]);
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.links.next).to.be.null;
          expect(res.body.links.prev).to.equal(`/progresses?type=user&page=${page - 1}&size=${size}&dev=true`);
          return done();
        });
    });

    it("Should return 500 Internal Server Error if there is an exception", function (done) {
      sinon.stub(progressesModel, "getPaginatedProgressDocument").throws(new Error("Database error"));

      chai
        .request(app)
        .get(`/progresses?type=user&dev=true&page=0&size=1`)
        .end((err, res) => {
          if (err) return done(err);

          if (err) {
            return done(err);
          }

          expect(res).to.have.status(500);
          expect(res.body).to.deep.equal({
            message: INTERNAL_SERVER_ERROR_MESSAGE,
          });
          return done();
        });
    });
  });
});
