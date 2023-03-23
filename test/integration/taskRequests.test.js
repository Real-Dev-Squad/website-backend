const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const tasksModel = require("../../models/tasks");
const userStatusModel = require("../../models/userStatus");
const taskRequestsModel = require("../../models/taskRequests");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const userData = require("../fixtures/user/user")();
const taskData = require("../fixtures/tasks/tasks")();
const userStatusData = require("../fixtures/userStatus/userStatus");
chai.use(chaiHttp);

const config = require("config");
const { TASK_REQUEST_STATUS } = require("../../constants/taskRequests");

const cookieName = config.get("userToken.cookieName");

let jwt;
let taskId;

const member = userData[9];
const member2 = userData[10];
const superUser = userData[4];
const activeMember = userData[0];

const idleUserStatus = userStatusData.idleStatus;
const activeUserStatus = userStatusData.activeStatus;
const oooUserStatus = userStatusData.userStatusDataForOooState;

describe("Task Requests", function () {
  let userId, superUserId;

  const mockVerify = (id) => sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: id }));

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  beforeEach(async function () {
    sinon.stub(authService, "generateAuthToken").callsFake(() => "valid_token");
  });

  describe("GET / - gets tasks requests", function () {
    describe("When the user is super user", function () {
      before(async function () {
        userId = await addUser(member);
        superUserId = await addUser(superUser);
        mockVerify(superUserId);
        jwt = authService.generateAuthToken({ userId: superUserId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.addOrUpdate(taskId, userId);
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
            expect(res.body.message).to.equal("Task requests returned successfully");
            expect(res.body.taskRequests).to.be.a("Array");
            expect(res.body.taskRequests.length).to.equal(1);
            return done();
          });
      });
    });

    describe("When the user is not a super user", function () {
      before(async function () {
        userId = await addUser(member);
        mockVerify(userId);
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.addOrUpdate(taskId);
      });

      it("should return 401 unauthorized user response", function (done) {
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

  describe("POST /taskRequests/addOrUpdate - add or updates a task request", function () {
    describe("When a new task requested is created", function () {
      before(async function () {
        userId = await addUser(member);
        mockVerify(userId);
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      it("should match response on success", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
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
            expect(res.body.message).to.equal("Task request successfully created");
            expect(res.body.taskRequest).to.be.a("object");
            expect(res.body.taskRequest.status).to.equal(TASK_REQUEST_STATUS.WAITING);
            expect(res.body.taskRequest.title).to.equal(taskData[4].title);
            expect(res.body.taskRequest.priority).to.equal(taskData[4].priority);
            return done();
          });
      });

      it("should match response on bad request", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taksId: taskId, // task key is mispelled intentionally
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("taskId not provided");
            return done();
          });
      });

      it("should match response when user id is not provided", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("userId not provided");
            return done();
          });
      });
    });

    describe("When task request already exists", function () {
      let userId2;
      before(async function () {
        userId = await addUser(member);
        userId2 = await addUser(member2);
        mockVerify(userId2);
        jwt = authService.generateAuthToken({ userId: userId2 });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.addOrUpdate(taskId, userId);
      });

      it("should update the requestor when a new user is requesting", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
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
            expect(res.body.message).to.equal("Task request successfully updated");
            return done();
          });
      });

      it("should throw 409 error when requestor already exists", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskId,
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.equal("User is already requesting for the task");
            return done();
          });
      });
    });
  });

  describe("PATCH /taskRequests/approve - approves task request", function () {
    let activeUserId, oooUserId;

    describe("When the user is super user", function () {
      before(async function () {
        userId = await addUser(member);
        activeUserId = await addUser(activeMember);
        oooUserId = await addUser(member2);
        superUserId = await addUser(superUser);
        jwt = authService.generateAuthToken({ userId: superUserId });
        mockVerify(superUserId);
        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.addOrUpdate(taskId, userId);
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        await userStatusModel.updateUserStatus(activeUserId, activeUserStatus);
        await userStatusModel.updateUserStatus(oooUserId, oooUserStatus);
      });

      it("should match response for successfull approval", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskRequestId: taskId,
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal(`Task successfully assigned to user ${member.username}`);
            return done();
          });
      });

      it("should return 409 error with message when user is active", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskRequestId: taskId,
            userId: activeUserId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.equal("User is currently active on another task");
            return done();
          });
      });

      it("should return 409 error with message when user is ooo", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskRequestId: taskId,
            userId: oooUserId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.equal("User is currently OOO");
            return done();
          });
      });

      it("should throw 400 error when userId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ userId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Invalid request body");
            return done();
          });
      });

      it("should throw 400 error when taskId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Invalid request body");
            return done();
          });
      });

      it("should throw 400 error when taskId and userId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Invalid request body");
            return done();
          });
      });
    });

    describe("When the user is not super user", function () {
      before(async function () {
        userId = await addUser(member);
        jwt = authService.generateAuthToken({ userId });
        mockVerify(userId);

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await taskRequestsModel.addOrUpdate(taskId);
      });

      it("should return unauthorized user response", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskRequestId: taskId,
            userId,
          })
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
});
