const chai = require("chai");

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

// eslint-disable-next-line mocha/no-skipped-tests
describe("Test Progress Updates API for Tasks", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("Verify POST Request Functionality", function () {
    let userId;
    let userToken;
    let taskId;
    beforeEach(async function () {
      userId = await addUser(userData[1]);
      userToken = authService.generateAuthToken({ userId: userId });
      taskId = await tasks.updateTask(taskData[0]);
    });

    it("Stores the progress entry for the task", async function () {
      const response = await chai
        .request(app)
        .post(`progresses`)
        .set("Cookie", `${cookieName}=${userToken}`)
        .send(taskProgressDay1(taskId));

      expect(response).to.have.status(200);
      expect(response.body).to.have.keys(["message", "data"]);
      expect(response.body.data).to.have.keys([
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
      expect(response.body.message).to.be.equal("task progress created successfully");
      expect(response.body.data.userId).to.be.equal(userId);
      expect(response.body.data.taskId).to.be.equal(taskId);
    });

    it("Gives 400 for invalid request body", function (done) {
      const incompleteProgressArray = incompleteTaskProgress(taskId);
      const requests = incompleteProgressArray.map((progress) => {
        return chai
          .request(app)
          .post(`progresses`)
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
        .post(`progresses`)
        .send(taskProgressDay1(taskId))
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Access denied: User authentication is required");
          return done();
        });
    });
  });

  describe("Verify GET Request Functionality", function () {
    let userId1;
    let userId2;
    let taskObject1;
    let taskId1;
    let taskObject2;
    let taskId2;
    let taskObject3;
    let taskId3;

    beforeEach(async function () {
      userId1 = await addUser(userData[1]);
      userId2 = await addUser(userData[2]);
      taskObject1 = await tasks.updateTask(taskData[0]);
      taskId1 = taskObject1.taskId;
      taskObject2 = await tasks.updateTask(taskData[1]);
      taskId2 = taskObject2.taskId;
      taskObject3 = await tasks.updateTask(taskData[2]);
      taskId3 = taskObject3.taskId;
      const progressData1 = stubbedModelTaskProgressData(userId1, taskId1, 1683957764140, 1683936000000);
      const progressData2 = stubbedModelTaskProgressData(userId2, taskId2, 1683957764140, 1683936000000);
      await firestore.collection("progresses").doc("taskProgressDocument1").set(progressData1);
      await firestore.collection("progresses").doc("taskProgressDocument2").set(progressData2);
      // const progressesDocs = await firestore.collection("progresses").get();
      // const docsData = [];
      // progressesDocs.forEach((doc) => {
      //   docsData.push({ id: doc.id, ...doc.data() });
      // });
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
});
