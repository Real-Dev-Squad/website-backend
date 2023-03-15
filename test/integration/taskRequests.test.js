const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const tasksModel = require("../../models/tasks");
const taskRequestsModel = require("../../models/taskRequests");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const userData = require("../fixtures/user/user")();
const taskData = require("../fixtures/tasks/tasks")();
chai.use(chaiHttp);

const config = require("config");
const cookieName = config.get("userToken.cookieName");

let jwt;
let taskId;

const member = userData[9];
const member2 = userData[10];
const superUser = userData[4];

describe("Task Requests", function () {
  let userId, userId2;
  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("GET / - gets tasks requests", function () {
    describe("When the user is super user", function () {
      before(async function () {
        userId = await addUser(member);
        const superUserId = await addUser(superUser);
        jwt = authService.generateAuthToken({ userId: superUserId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.createTaskRequest(taskId, userId);
      });

      it("should fetch taskRequests", function (done) {
        chai
          .request(app)
          .get("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            return done();
          });
      });
    });

    describe("When the user is not a super user", function () {
      before(async function () {
        userId = await addUser(member);
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.createTaskRequest(taskId, userId);
      });
      it("should return unauthorized user response", function (done) {
        chai
          .request(app)
          .get("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(401);
            return done();
          });
      });
    });
  });

  describe("PUT /taskRequests/create - creates a new task request", function () {
    describe("When a new task requested is created", function () {
      before(async function () {
        userId = await addUser(member);
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      it("should match response on success", function (done) {
        chai
          .request(app)
          .put("/taskRequests/create")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskId,
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(201);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Task request created successfully");
            expect(res.body.taskRequest).to.be.a("object");
            return done();
          });
      });

      it("should match response on unauthorized user", function (done) {
        chai
          .request(app)
          .put("/taskRequests/create")
          .send({
            taskId,
            userId,
          })
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
    });

    describe("When task request already exists", function () {
      before(async function () {
        userId = await addUser(member);
        userId2 = await addUser(member2);
        jwt = authService.generateAuthToken({ userId2 });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.createTaskRequest(taskId, userId);
      });

      it("should add user if different user requests for task", function (done) {
        chai
          .request(app)
          .put("/taskRequests/create")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskId,
            userId: userId2,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Task request updated successfully");
            return done();
          });
      });

      it("should match response if user is already has requested before", function (done) {
        chai
          .request(app)
          .put("/taskRequests/create")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskId,
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("User already exists");
            return done();
          });
      });
    });
  });
});
