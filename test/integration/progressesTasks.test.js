const chai = require("chai");
const sinon = require("sinon");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");
const tasks = require("../../models/tasks");
const progressesModel = require("../../models/progresses");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const {
  taskProgressDay1,
  stubbedModelTaskProgressData,
  incompleteTaskProgress,
} = require("../fixtures/progress/progresses");

const userData = require("../fixtures/user/user")();
const withDiscordMembership = require("../utils/withDiscordMembership");
const taskData = require("../fixtures/tasks/tasks")();
const { INTERNAL_SERVER_ERROR_MESSAGE, UNAUTHORIZED_WRITE } = require("../../constants/progresses");
const cookieName = config.get("userToken.cookieName");
const { expect } = chai;

describe("Test Progress Updates API for Tasks", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("Verify POST Request Functionality", function () {
    let clock;
    let userId;
    let userToken;
    let taskId1;
    let taskId2;
    let fetchMock;
    let archivedUserId;
    let archivedUserToken;

    beforeEach(async function () {
      fetchMock = sinon.stub(global, "fetch");
      clock = sinon.useFakeTimers({
        now: new Date(Date.UTC(2023, 4, 2, 0, 25)).getTime(), // UTC time equivalent to 5:55 AM IST
        toFake: ["Date"],
      });
      userId = await addUser(withDiscordMembership(userData[1]));
      archivedUserId = await addUser(userData[5]);
      archivedUserToken = authService.generateAuthToken({ userId: archivedUserId });
      userToken = authService.generateAuthToken({ userId: userId });
      const taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      const taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;

      const progressData = stubbedModelTaskProgressData(userId, taskId1, 1682935200000, 1682899200000);
      await firestore.collection("progresses").doc("taskProgressDoc").set(progressData);
    });

    afterEach(function () {
      sinon.restore();
      clock.restore();
    });

    it("Stores the task progress entry", function (done) {
      fetchMock.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({}),
        })
      );
      chai
        .request(app)
        .post(`/progresses`)
        .set("Cookie", `${cookieName}=${userToken}`)
        .send(taskProgressDay1(taskId2))
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.data).to.have.keys([
            "id",
            "userId",
            "taskId",
            "type",
            "completed",
            "planned",
            "blockers",
            "createdAt",
            "date",
          ]);
          expect(res.body.message).to.be.equal("Task Progress document created successfully.");
          expect(res.body.data.userId).to.be.equal(userId);
          expect(res.body.data.taskId).to.be.equal(taskId2);
          return done();
        });
    });

    it("stores the user progress document for the previous day if the update is sent before 6am IST", function (done) {
      clock.setSystemTime(new Date(Date.UTC(2023, 4, 2, 0, 29)).getTime()); // 2nd May 2023 05:59 am IST
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(taskProgressDay1(taskId2))
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
        .send(taskProgressDay1(taskId2))
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body.data.date).to.be.equal(1682985600000); // 2nd May 2023
          return done();
        });
    });

    it("throws Conflict Error 409 if the task progress is updated multiple times in a day", function (done) {
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(taskProgressDay1(taskId1))
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(409);
          expect(res.body).to.have.key("message");
          expect(res.body.message).to.be.equal("Task Progress for the day has already been created.");
          return done();
        });
    });

    it("Gives 400 for invalid request body", function (done) {
      const incompleteProgressArray = incompleteTaskProgress(taskId1);
      const requests = incompleteProgressArray.map((progress) => {
        return chai
          .request(app)
          .post(`/progresses`)
          .set("Cookie", `${cookieName}=${userToken}`)
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
        .post(`/progresses`)
        .send(taskProgressDay1(taskId1))
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });

    it("should return forbidden response when user is not in discord", function (done) {
      chai
        .request(app)
        .post("/progresses")
        .set("Cookie", `${cookieName}=${archivedUserToken}`)
        .send(taskProgressDay1("1111"))
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.equal(UNAUTHORIZED_WRITE);
          return done();
        });
    });
  });

  describe("Verify the GET progress records", function () {
    let userId1;
    let userId2;
    let taskId1;
    let taskId2;
    let taskObject3;
    let taskId3;

    beforeEach(async function () {
      userId1 = await addUser(withDiscordMembership(userData[1]));
      userId2 = await addUser(withDiscordMembership(userData[2]));
      const taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      const taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;
      taskObject3 = await tasks.updateTask(taskData[2]);
      taskId3 = taskObject3.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId1, taskId1, 1683957764140, 1683936000000); // Date:Sat May 13 2023 05:30:00
      const progressData2 = stubbedModelTaskProgressData(userId2, taskId2, 1683957764140, 1684022400000); // Date:Sun May 14 2023 05:30:00
      const progressData4 = stubbedModelTaskProgressData(userId1, taskId1, 1684022400000, 1684195200000); // Date:Sun May 16 2023 05:30:00
      const progressData3 = stubbedModelTaskProgressData(userId2, taskId2, 1683957764140, 1684108800000); // Date:Mon May 15 2023 05:30:00

      await firestore.collection("progresses").doc("taskProgressDocument3").set(progressData3);
      await firestore.collection("progresses").doc("taskProgressDocument4").set(progressData4);
      await firestore.collection("progresses").doc("taskProgressDocument1").set(progressData1);
      await firestore.collection("progresses").doc("taskProgressDocument2").set(progressData2);
    });

    it("Returns the progress array for the task", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId1}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "taskId",
              "type",
              "completed",
              "planned",
              "userData",
              "blockers",
              "userId",
              "createdAt",
              "date",
            ]);
          });
          return done();
        });
    });

    it("Returns a 404 error when the task does not exist", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=nonExistingTaskId&dev=true`)
        .end((err, res) => {
          if (err) return done(err);

          expect(res).to.have.status(404);
          expect(res.body).to.have.keys(["message"]);
          expect(res.body.message).to.be.equal(`Task with id nonExistingTaskId does not exist.`);

          return done();
        });
    });

    it("Gives 400 status when anything other than -date or date is supplied", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId1}&orderBy=-randomfield`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);

          return done();
        });
    });

    it("Returns the progress array with latest date first", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId1}`)
        .end((err, res) => {
          if (err) return done(err);
          res.body.data.forEach((progress, idx) => {
            if (idx !== 0) {
              expect(res.body.data[idx - 1].date).greaterThan(progress.date);
            }
          });

          return done();
        });
    });

    it("Returns the progress array with latest date first if query -date is supplied", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId1}&orderBy=-date`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          res.body.data.forEach((progress, idx) => {
            if (idx !== 0) {
              expect(res.body.data[idx - 1].date).greaterThan(progress.date);
            }
          });

          return done();
        });
    });

    it("Returns the progress array with oldest date first if query date is supplied", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId1}&orderBy=date`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          res.body.data.forEach((progress, idx) => {
            if (idx !== 0) {
              expect(progress.date).greaterThan(res.body.data[idx - 1].date);
            }
          });
          return done();
        });
    });

    it("Returns the progress array for all the tasks", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=task`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.count).to.be.equal(4);
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "taskId",
              "type",
              "completed",
              "planned",
              "userData",
              "blockers",
              "userId",
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

    it("Returns 404 for invalid task id", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=invalidUserId`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("Task with id invalidUserId does not exist.");
          return done();
        });
    });

    it("Returns 404 if the progress document doesn't exist for the task", function (done) {
      chai
        .request(app)
        .get(`/progresses?taskId=${taskId3}`)
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
    let taskObject1;
    let taskId1;
    let taskObject2;
    let taskId2;

    beforeEach(async function () {
      userId = await addUser(withDiscordMembership(userData[1]));
      taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId, taskId1, 1683626400000, 1683590400000); // 2023-05-09
      const progressData2 = stubbedModelTaskProgressData(userId, taskId1, 1683885600000, 1683849600000); // 2023-05-12
      await firestore.collection("progresses").doc("taskProgressDocument1").set(progressData1);
      await firestore.collection("progresses").doc("taskProgressDocument2").set(progressData2);
    });

    it("Verifies the progress records for a task within the specified date range.", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?taskId=${taskId1}&startDate=2023-05-09&endDate=2023-05-12`)
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
        .get(`/progresses/range?taskId=${taskId1}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Start date and End date is mandatory.");
          return done();
        });
    });

    it("Returns 404 for invalid task id", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?taskId=invalidTaskId&startDate=2023-05-09&endDate=2023-05-12`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("Task with id invalidTaskId does not exist.");
          return done();
        });
    });

    it("Returns 404 if the progress document doesn't exist", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?taskId=${taskId2}&startDate=2023-05-09&endDate=2023-05-12`)
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
    let taskId;
    let anotherTaskId;

    beforeEach(async function () {
      userId = await addUser(withDiscordMembership(userData[0]));
      const taskObject = await tasks.updateTask(taskData[0]);
      taskId = taskObject.taskId;
      const anotherTaskObject = await tasks.updateTask(taskData[0]);
      anotherTaskId = anotherTaskObject.taskId;
      const progressData = stubbedModelTaskProgressData(userId, taskId, 1683072000000, 1682985600000);
      await firestore.collection("progresses").doc("progressDoc").set(progressData);
    });

    it("Returns the progress data for a specific task", function (done) {
      chai
        .request(app)
        .get(`/progresses/task/${taskId}/date/2023-05-02`)
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
            "taskId",
            "createdAt",
            "date",
          ]);
          return done();
        });
    });

    it("Should return 404 No progress records found if the document doesn't exist", function (done) {
      chai
        .request(app)
        .get(`/progresses/task/${taskId}/date/2023-05-03`)
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
        .get(`/progresses/task/${taskId}/date/2023-05-33`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal('"date" must be in ISO 8601 date format');
          return done();
        });
    });

    it("Returns 404 for invalid task id", function (done) {
      chai
        .request(app)
        .get(`/progresses/task/invalidTaskId/date/2023-05-02`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("Task with id invalidTaskId does not exist.");
          return done();
        });
    });

    it("Returns 404 if the progress document doesn't exist for the task", function (done) {
      chai
        .request(app)
        .get(`/progresses/task/${anotherTaskId}/date/2023-05-02`)
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
      const userId = await addUser(withDiscordMembership(userData[1]));
      const taskObject1 = await tasks.updateTask(taskData[0]);
      const taskId1 = taskObject1.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId, taskId1, 1683626400000, 1683590400000); // 2023-05-09
      const progressData2 = stubbedModelTaskProgressData(userId, taskId1, 1683885600000, 1683849600000); // 2023-05-12
      await firestore.collection("progresses").doc("taskProgressDocument1").set(progressData1);
      await firestore.collection("progresses").doc("taskProgressDocument2").set(progressData2);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should return paginated results when dev=true is passed", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=task&dev=true&page=0&size=1`)
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
              "userId",
              "userData",
              "taskId",
              "createdAt",
              "date",
            ]);
          });

          return done();
        });
    });

    it("should not return paginated results when dev=false is passed", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=task&dev=false&page=0&size=1`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.count).to.not.equal(1);
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
              "taskId",
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
        .get(`/progresses?type=task&dev=true&page=${page}&size=${size}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["message", "data", "count", "links"]);
          expect(res.body.links).to.have.keys(["next", "prev"]);
          expect(res.body.data).to.be.an("array");
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.links.next).to.be.equal(null);
          expect(res.body.links.prev).to.equal(`/progresses?type=task&page=${page - 1}&size=${size}&dev=true`);
          return done();
        });
    });

    it("should return a bad request error for invalid size parameter", function (done) {
      chai
        .request(app)
        .get(`/progresses?type=task&dev=true&page=0&size=104`)
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
        .get(`/progresses?type=task&dev=true&page=${page}&size=${size}`)
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
          expect(res.body.links.prev).to.equal(`/progresses?type=task&page=${page - 1}&size=${size}&dev=true`);
          return done();
        });
    });

    it("Should return 500 Internal Server Error if there is an exception", function (done) {
      sinon.stub(progressesModel, "getPaginatedProgressDocument").throws(new Error("Database error"));

      chai
        .request(app)
        .get(`/progresses?type=task&dev=true&page=0&size=1`)
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
