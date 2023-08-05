const chai = require("chai");
const sinon = require("sinon");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");
const tasks = require("../../models/tasks");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const {
  taskProgressDay1,
  stubbedModelTaskProgressData,
  incompleteTaskProgress,
} = require("../fixtures/progress/progresses");

const userData = require("../fixtures/user/user")();
const taskData = require("../fixtures/tasks/tasks")();

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
    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date(Date.UTC(2023, 4, 2, 0, 25)).getTime(), // UTC time equivalent to 5:55 AM IST
        toFake: ["Date"],
      });
      userId = await addUser(userData[1]);
      userToken = authService.generateAuthToken({ userId: userId });
      const taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      const taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;

      const progressData = stubbedModelTaskProgressData(userId, taskId1, 1682935200000, 1682899200000);
      await firestore.collection("progresses").doc("taskProgressDoc").set(progressData);
    });

    afterEach(function () {
      clock.restore();
    });

    it("Stores the task progress entry", function (done) {
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

    it("throw 400 if task progress is updated on a non working day (Sunday)", function (done) {
      // Set the current date to a Sunday (e.g., 2023-07-22) using sinon.
      clock.setSystemTime(new Date(Date.UTC(2023, 6, 23, 4, 29)).getTime()); // 2nd May 2023 05:59 am IST
      chai
        .request(app)
        .post(`/progresses`)
        .set("cookie", `${cookieName}=${userToken}`)
        .send(taskProgressDay1(taskId1))
        .end((err, res) => {
          clock.restore(); // Restore the original clock after the request is made.
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.key("message");
          expect(res.body.message).to.be.equal("Progress document cannot be created on non working days (Sundays)");
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
  });

  describe("Verify the GET progress records", function () {
    let userId1;
    let userId2;
    let taskId1;
    let taskId2;
    let taskObject3;
    let taskId3;

    beforeEach(async function () {
      userId1 = await addUser(userData[1]);
      userId2 = await addUser(userData[2]);
      const taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      const taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;
      taskObject3 = await tasks.updateTask(taskData[2]);
      taskId3 = taskObject3.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId1, taskId1, 1683957764140, 1683936000000);
      const progressData2 = stubbedModelTaskProgressData(userId2, taskId2, 1683957764140, 1683936000000);
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
              "blockers",
              "userId",
              "createdAt",
              "date",
            ]);
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
          expect(res.body.count).to.be.equal(2);
          res.body.data.forEach((progress) => {
            expect(progress).to.have.keys([
              "id",
              "taskId",
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
      userId = await addUser(userData[1]);
      taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId, taskId1, 1683626400000, 1683590400000); // 2023-05-09
      const progressData2 = stubbedModelTaskProgressData(userId, taskId1, 1683885600000, 1683849600000); // 2023-05-12
      const progressData3 = stubbedModelTaskProgressData(userId, taskId1, 1684153600000, 1684153600000); // 2023-05-15
      await firestore.collection("progresses").doc("taskProgressDocument1").set(progressData1);
      await firestore.collection("progresses").doc("taskProgressDocument2").set(progressData2);
      await firestore.collection("progresses").doc("taskProgressDocument3").set(progressData3);
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

    it("Verifies the progress records for a task within the specified date range ignoring sunday", function (done) {
      chai
        .request(app)
        .get(`/progresses/range?taskId=${taskId1}&startDate=2023-05-09&endDate=2023-05-15`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an("object");
          expect(res.body).to.have.keys(["message", "data"]);
          expect(res.body.message).to.be.equal("Progress document retrieved successfully.");
          expect(res.body.data).to.have.keys(["startDate", "endDate", "progressRecords"]);
          expect(res.body.data.startDate).to.be.equal("2023-05-09");
          expect(res.body.data.endDate).to.be.equal("2023-05-15");
          expect(res.body.data.progressRecords).to.have.key([
            "2023-05-09",
            "2023-05-10",
            "2023-05-11",
            "2023-05-12",
            "2023-05-13",
            "2023-05-15",
          ]);
          expect(res.body.data.progressRecords["2023-05-09"]).to.be.equal(true);
          expect(res.body.data.progressRecords["2023-05-10"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-11"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-12"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-13"]).to.be.equal(false);
          expect(res.body.data.progressRecords["2023-05-15"]).to.be.equal(true);
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
      userId = await addUser(userData[0]);
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
});
