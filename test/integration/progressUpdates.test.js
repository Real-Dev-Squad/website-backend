const chai = require("chai");

const app = require("../../server");

const authService = require("../../services/authService");

const tasks = require("../../models/tasks");

const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const userData = require("../fixtures/user/user")();
const taskData = require("../fixtures/tasks/tasks")();
const progressData = require("../fixtures/progressUpdates/progressUpdates")();

const cookieName = config.get("userToken.cookieName");
const superUser = userData[4];
const { object } = require("joi");
const { expect } = chai;

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("Test Progress Updates API", function () {
  let superUserId;
  let superUserAuthToken;
  let jwt;
  let taskId;
  let userId = "";
  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    taskId = tasks.updateTask(taskData[0]);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("Test the mark api", function () {
    it("Marked the task as monitored by superuser", function (done) {
      chai
        .request(app)
        .post(`/progressupdates/${taskId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          monitor: true,
          frequency: 2,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body).to.have.keys(["message", "id"]);
          expect(res.body.id).to.be.equal(taskId);
          expect(res.body.message).to.be.equal("task marked for progress updates");
          const storedTask = tasks.fetchTask(taskId);
          expect(storedTask.monitored).to.be.equal(true);
          expect(storedTask.frequency).to.be.equal(2);
          return done();
        });
    });

    it("Unmarked the task as monitored by superuser", function (done) {
      taskId = tasks.updateTask(taskData[5]);
      chai
        .request(app)
        .post(`/progressupdates/${taskId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          monitor: false,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.a(object);
          expect(res.body).to.have.keys(["message", "id"]);
          expect(res.body.id).to.be.equal(taskId);
          expect(res.body.message).to.be.equal("task unmarked for progress updates");
          const storedTask = tasks.fetchTask(taskId);
          expect(storedTask.monitored).to.be.equal(false);
          return done();
        });
    });

    it("Returns 401 for normal users", function (done) {
      taskId = tasks.updateTask(taskData[5]);
      chai
        .request(app)
        .post(`/progressupdates/${taskId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send({
          monitor: false,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });

    it("Returns 404 for invalid task id's", function (done) {
      chai
        .request(app)
        .post(`/progressupdates/123`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send({
          monitor: false,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("Task id not found");
          return done();
        });
    });
  });

  describe("Test the save api", function () {
    it("Saves the progress updates", function (done) {
      chai
        .request(app)
        .post(`progressupdates/save/${taskId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(progressData[0])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("task update added successfully");
          expect(res.body.id).to.be.equal(taskId);
          return done();
        });
    });

    it("Gives 400 for invalid request body", function (done) {
      chai
        .request(app)
        .post(`progressupdates/save/${taskId}`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(progressData[1])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("timestamp is required");
          return done();
        });
    });

    it("Gives 401 for unauthenticated user", function (done) {
      chai
        .request(app)
        .post(`progressupdates/save/${taskId}`)
        .send(progressData[1])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("Unauthenticated user");
          return done();
        });
    });

    it("Gives 404 for invalid task id", function (done) {
      chai
        .request(app)
        .post(`progressupdates/save/123`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(progressData[0])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("task id not found");
          return done();
        });
    });
  });

  describe("Test the get Updates API", function () {
    it("Returns the latest progress detail", function (done) {
      chai
        .request(app)
        .get(`/progressupdates/${taskId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(["timestamp", "progress", "plan", "blockers"]);
          return done();
        });
    });

    it("Returns 404 for invalid task id", function (done) {
      chai
        .request(app)
        .get(`/progressupdates/${taskId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("task id not found");
          return done();
        });
    });
  });
});
