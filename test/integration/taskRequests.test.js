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
      });

      it("should fetch 404 when taskRequests are empty", function (done) {
        chai
          .request(app)
          .get("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(404);
            return done();
          });
      });

      it("should fetch taskRequests", async function () {
        await taskRequestsModel.addOrUpdate(taskId, userId);

        chai
          .request(app)
          .get("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .then(function (err, res) {
            if (err) {
              return err;
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.equal("Task requests returned successfully");
            expect(res.body.data).to.be.a("Array");
            expect(res.body.data.length).to.equal(1);
            expect(res.body.data[0]).to.have.property("requestors");
            expect(res.body.data[0].requestors.length).to.equal(1);
            return res;
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

  describe("GET /taskRequest/:id - fetches task request by id", function () {
    describe("When the user is super user", function () {
      let taskRequestId;
      before(async function () {
        superUserId = await addUser(superUser);
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));
        jwt = authService.generateAuthToken({ userId: superUserId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
        taskRequestId = (await taskRequestsModel.addOrUpdate(taskId, userId)).id;
      });

      it("should fetch the task request", function (done) {
        chai
          .request(app)
          .get(`/taskRequests/${taskRequestId}`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.equal("Task request returned successfully");
            expect(res.body.data).to.be.a("object");
            return done();
          });
      });

      it("should return 404 if the resource is not found", function (done) {
        sinon.stub(taskRequestsModel, "fetchTaskRequestById").callsFake(() => []);

        chai
          .request(app)
          .get(`/taskRequests/taskRequestId`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(404);
            expect(res.body.message).to.be.equal("Task request not found");
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

      it("should return 401 status code", function (done) {
        chai
          .request(app)
          .get(`/taskRequests/taskrequstid`)
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

    describe("When task does not exist", function () {
      let userId;

      before(async function () {
        userId = await addUser(member);
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));

        jwt = authService.generateAuthToken({ userId });
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
      });

      it("should return 409 error", function (done) {
        chai
          .request(app)
          .post("/taskRequests/addOrUpdate")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskId: "random taskId",
            userId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.equal("Task does not exist");
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
    let activeUserId, oooUserId, taskRequest;

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
        taskRequest = await taskRequestsModel.addOrUpdate(taskId, userId);
      });

      it("should match response for successfull approval", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            taskRequestId: taskRequest.id,
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
