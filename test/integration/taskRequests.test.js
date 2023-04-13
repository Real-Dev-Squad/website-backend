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

const {
  idleStatus: idleUserStatus,
  activeStatus: activeUserStatus,
  userStatusDataForOooState: oooUserStatus,
} = userStatusData;

describe("Task Requests", function () {
  let userId, superUserId;

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
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));
        jwt = authService.generateAuthToken({ userId: superUserId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
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
            expect(res.body.data).to.be.a("object");
            expect(res.body.data.taskRequests).to.be.a("Array");
            expect(res.body.data.taskRequests.length).to.equal(1);
            expect(res.body.data.users).to.be.a("Array");
            expect(res.body.data.users.length).to.equal(1);
            return done();
          });
      });
    });

    describe("When the user is not a super user", function () {
      before(async function () {
        userId = await addUser(member);
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;

        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        await taskRequestsModel.addOrUpdate(taskId, userId);
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
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
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
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: userId2 }));
        jwt = authService.generateAuthToken({ userId: userId2 });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        await userStatusModel.updateUserStatus(userId2, idleUserStatus);
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

    describe("When user status does not exist", function () {
      before(async function () {
        userId = await addUser(member);
        sinon.stub(userStatusModel, "getUserStatus").callsFake(() => ({ userStatusExists: false }));
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      it("should match response", function (done) {
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
            expect(res.body.message).to.equal("User status does not exist");
            return done();
          });
      });
    });

    describe("When the user status is not idle", function () {
      before(async function () {
        userId = await addUser(member);
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      it("should match response when the user is OOO", function (done) {
        sinon.stub(userStatusModel, "getUserStatus").callsFake(() => ({ userStatusExists: true, data: oooUserStatus }));
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
            expect(res.body.message).to.equal("User is currently OOO");
            return done();
          });
      });

      it("should match response when the user is active on another task", function (done) {
        sinon
          .stub(userStatusModel, "getUserStatus")
          .callsFake(() => ({ userStatusExists: true, data: activeUserStatus }));

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
            expect(res.body.message).to.equal("User is currently active on another task");
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
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;

        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        await userStatusModel.updateUserStatus(activeUserId, activeUserStatus);
        await userStatusModel.updateUserStatus(oooUserId, { ...oooUserStatus });
        await taskRequestsModel.addOrUpdate(taskId, userId);
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

      it("should throw 400 error when taskRequestId is missing", function (done) {
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
            expect(res.body.message).to.equal("taskRequestId not provided");
            return done();
          });
      });

      it("should throw 400 error when userId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskRequestId: taskId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("userId not provided");
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
            expect(res.body.message).to.equal("taskRequestId not provided");
            return done();
          });
      });
    });

    describe("When the user is not super user", function () {
      before(async function () {
        userId = await addUser(member);
        jwt = authService.generateAuthToken({ userId });
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        await taskRequestsModel.addOrUpdate(taskId, userId);
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
