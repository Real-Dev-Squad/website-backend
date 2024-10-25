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
const mockData = require("../fixtures/task-requests/task-requests");
const userStatusData = require("../fixtures/userStatus/userStatus");
const firestore = require("../../utils/firestore");
const logsModel = firestore.collection("logs");
const { MIGRATION_TYPE } = require("../../constants/taskRequests");
const taskRequestsCollection = firestore.collection("taskRequests");

chai.use(chaiHttp);

const config = require("config");
const { TASK_REQUEST_TYPE, TASK_REQUEST_STATUS, TASK_REQUEST_ACTIONS } = require("../../constants/taskRequests");
const usersUtils = require("../../utils/users");
const githubService = require("../../services/githubService");
const { userState } = require("../../constants/userStatus");

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

      it("should have status 200 when taskRequests are empty", function (done) {
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

      it("should be successful when the user is not a super user", function (done) {
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

      it("should be successful when the user is not a super user", function (done) {
        chai
          .request(app)
          .get(`/taskRequests/taskrequstid`)
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
    });

    describe("When the user status is not idle", function () {
      before(async function () {
        userId = await addUser(member);
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
        jwt = authService.generateAuthToken({ userId });

        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });
    });
  });

  describe("PATCH /taskRequests/approve - approves task request", function () {
    let activeUserId, oooUserId;

    describe("When the user is super user", function () {
      beforeEach(async function () {
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

      afterEach(async function () {
        sinon.restore();
        await cleanDb();
      });

      it("should match response for successfull approval", function (done) {
        sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ approvedTo: member.username, taskRequest: {} });
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
            expect(res.body.message).to.equal(`Task updated successfully.`);
            return done();
          });
      });

      it("should throw 400 error when taskRequestId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({
            userId: oooUserId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("taskRequestId not provided");
            return done();
          });
      });

      it("should throw 400 error when task request id provided doesn't exist", function (done) {
        sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ taskRequestNotFound: true });
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskRequestId: taskId, userId, activeUserId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.message).to.equal("Task request not found.");
            expect(res).to.have.status(400);

            return done();
          });
      });

      it("should throw 400 error when user did not request for a task", function (done) {
        sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ isUserInvalid: true });
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskRequestId: taskId, userId, activeUserId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.message).to.equal("User request not available.");
            expect(res).to.have.status(400);

            return done();
          });
      });

      it("should throw 400 error when task was previously approved or rejected.", function (done) {
        sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ isTaskRequestInvalid: true });
        chai
          .request(app)
          .patch("/taskRequests/approve")
          .set("cookie", `${cookieName}=${jwt}`)
          .send({ taskRequestId: taskId, userId, activeUserId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.message).to.equal("Task request was previously approved or rejected.");
            expect(res).to.have.status(400);

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

      describe("Checks the user status", function () {
        it("Should change the user status to ACTIVE when request is successful", async function () {
          sinon
            .stub(taskRequestsModel, "approveTaskRequest")
            .resolves({ approvedTo: member.username, taskRequest: { taskRequestId: taskId } });
          const res = await chai
            .request(app)
            .patch("/taskRequests/approve")
            .set("cookie", `${cookieName}=${jwt}`)
            .send({
              taskRequestId: taskId,
              userId,
            });

          expect(res).to.have.status(200);
          const userStatus = await userStatusModel.getUserStatus(userId);
          expect(userStatus.data.currentStatus.state).to.be.equal(userState.ACTIVE);
        });

        it("Should not change the user status to ACTIVE when request is unsuccessful", async function () {
          sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ isTaskRequestInvalid: true });
          const res = await chai
            .request(app)
            .patch("/taskRequests/approve")
            .set("cookie", `${cookieName}=${jwt}`)
            .send({
              taskRequestId: taskId,
              userId,
            });

          expect(res).to.have.status(400);
          const userStatus = await userStatusModel.getUserStatus(userId);
          expect(userStatus.data.currentStatus.state).to.be.equal(userState.IDLE);
        });
      });
    });

    describe("task request logs", function () {
      beforeEach(async function () {
        userId = await addUser(member);
        superUserId = await addUser(superUser);

        jwt = authService.generateAuthToken({ userId: superUserId });
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      afterEach(async function () {
        sinon.restore();
        await cleanDb();
      });

      it("should save logs of approved requests", async function () {
        sinon
          .stub(taskRequestsModel, "approveTaskRequest")
          .resolves({ approvedTo: member.username, taskRequest: { taskRequestId: taskId } });
        await chai.request(app).patch("/taskRequests/approve").set("cookie", `${cookieName}=${jwt}`).send({
          taskRequestId: taskId,
          userId,
        });
        const logsRef = await logsModel.where("type", "==", "taskRequests").get();
        let taskRequestLogs;
        logsRef.forEach((data) => {
          taskRequestLogs = data.data();
        });
        expect(taskRequestLogs.body.taskRequestId).to.be.equal(taskId);
      });

      it("should not save logs of failed requests", async function () {
        sinon.stub(taskRequestsModel, "approveTaskRequest").resolves({ taskRequestNotFound: true });
        await chai.request(app).patch("/taskRequests/approve").set("cookie", `${cookieName}=${jwt}`).send({
          taskRequestId: taskId,
          userId,
        });
        const logsRef = await logsModel.where("type", "==", "taskRequests").get();
        let taskRequestLogs;
        logsRef.forEach((data) => {
          taskRequestLogs = data.data();
        });
        expect(taskRequestLogs).to.be.equal(undefined);
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

  describe("PATCH /taskRequests/ - updates task request", function () {
    let activeUserId, oooUserId;
    const taskRequestId = "taskRequest123";

    beforeEach(async function () {
      userId = await addUser(member);
      const existingTaskRequest = { ...mockData.existingTaskRequest };
      existingTaskRequest.users[0].userId = userId;
      await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
    });

    describe("When the user is super user", function () {
      beforeEach(async function () {
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

      afterEach(async function () {
        sinon.restore();
        await cleanDb();
      });

      it("should match response for successful approval", async function () {
        const existingTaskRequest = { ...mockData.existingTaskRequest, requestType: TASK_REQUEST_TYPE.CREATION };
        await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
        const res = await chai
          .request(app)
          .patch("/taskRequests/")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({
            taskRequestId: taskRequestId,
            userId,
          });
        expect(res.body.message).to.equal(`Task updated successfully.`);
        expect(res).to.have.status(200);
      });

      it("should match response for successful rejection", async function () {
        const res = await chai
          .request(app)
          .patch("/taskRequests/")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.REJECT })
          .send({
            taskRequestId: taskRequestId,
            userId,
          });

        expect(res).to.have.status(200);
        expect(res.body.message).to.equal(`Task updated successfully.`);
      });

      it("should throw 400 error when taskRequestId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({
            userId: oooUserId,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("taskRequestId not provided");
            return done();
          });
      });

      it("should throw 400 error when task request id provided doesn't exist", function (done) {
        chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({ taskRequestId: "123435", userId, activeUserId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.message).to.equal("Task request not found.");
            expect(res).to.have.status(400);

            return done();
          });
      });

      it("should throw 400 error when task request id provided doesn't exist for rejection", function (done) {
        chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.REJECT })
          .send({ taskRequestId: taskId, userId, activeUserId })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.message).to.equal("Task request not found.");
            expect(res).to.have.status(400);

            return done();
          });
      });

      it("should throw 400 error when user did not request for a task", async function () {
        const res = await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({ taskRequestId: taskRequestId, userId: activeUserId, activeUserId });

        expect(res.body.message).to.equal("User request not available.");
        expect(res).to.have.status(400);
      });

      it("should throw 400 error when task was previously approved or rejected.", async function () {
        const existingTaskRequest = { ...mockData.existingTaskRequest, status: TASK_REQUEST_STATUS.APPROVED };
        await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
        const res = await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({ taskRequestId: taskRequestId, userId, activeUserId });

        expect(res.body.message).to.equal("Task request was previously approved or rejected.");
        expect(res).to.have.status(400);
      });

      it("should throw 400 error when task was previously approved or rejected for rejection", async function () {
        const existingTaskRequest = { ...mockData.existingTaskRequest, status: TASK_REQUEST_STATUS.APPROVED };
        await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
        const res = await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.REJECT })
          .send({ taskRequestId: taskRequestId, userId, activeUserId });

        expect(res.body.message).to.equal("Task request was previously approved or rejected.");
        expect(res).to.have.status(400);
      });

      it("should throw 400 error when userId is missing", function (done) {
        chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
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

      describe("Checks the user status", function () {
        it("Should change the user status to ACTIVE when request is successful for approval", async function () {
          const res = await chai
            .request(app)
            .patch("/taskRequests")
            .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
            .set("cookie", `${cookieName}=${jwt}`)
            .send({
              taskRequestId: taskRequestId,
              userId,
            });

          expect(res).to.have.status(200);
          const userStatus = await userStatusModel.getUserStatus(userId);
          expect(userStatus.data.currentStatus.state).to.be.equal(userState.ACTIVE);
        });

        it("Should not change the user status to ACTIVE when request is successful for rejection", async function () {
          const res = await chai
            .request(app)
            .patch("/taskRequests")
            .query({ action: TASK_REQUEST_ACTIONS.REJECT })
            .set("cookie", `${cookieName}=${jwt}`)
            .send({
              taskRequestId: taskRequestId,
              userId,
            });

          expect(res).to.have.status(200);
          const userStatus = await userStatusModel.getUserStatus(userId);
          expect(userStatus.data.currentStatus.state).to.be.equal(userState.IDLE);
        });

        it("Should not change the user status to ACTIVE when request is unsuccessful", async function () {
          const res = await chai
            .request(app)
            .patch("/taskRequests/approve")
            .set("cookie", `${cookieName}=${jwt}`)
            .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
            .send({
              taskRequestId: taskId,
              userId,
            });

          expect(res).to.have.status(400);
          const userStatus = await userStatusModel.getUserStatus(userId);
          expect(userStatus.data.currentStatus.state).to.be.equal(userState.IDLE);
        });
      });
    });

    describe("task request logs", function () {
      beforeEach(async function () {
        userId = await addUser(member);
        superUserId = await addUser(superUser);

        jwt = authService.generateAuthToken({ userId: superUserId });
        sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));
        await userStatusModel.updateUserStatus(userId, idleUserStatus);
        taskId = (await tasksModel.updateTask(taskData[4])).taskId;
      });

      afterEach(async function () {
        sinon.restore();
        await cleanDb();
      });

      it("should save logs of approved requests", async function () {
        await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({
            taskRequestId: taskRequestId,
            userId,
          });
        const logsRef = await logsModel.where("type", "==", "taskRequests").get();
        let taskRequestLogs;
        logsRef.forEach((data) => {
          taskRequestLogs = data.data();
        });

        expect(taskRequestLogs.meta.taskRequestId).to.be.equal(taskRequestId);
      });

      it("should save logs of rejected requests", async function () {
        await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.REJECT })
          .send({
            taskRequestId: taskRequestId,
            userId,
          });
        const logsRef = await logsModel.where("type", "==", "taskRequests").get();
        let taskRequestLogs;
        logsRef.forEach((data) => {
          taskRequestLogs = data.data();
        });
        expect(taskRequestLogs.meta.taskRequestId).to.be.equal(taskRequestId);
      });

      it("should not save logs of failed requests", async function () {
        await chai
          .request(app)
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
          .send({
            taskRequestId: taskId,
            userId,
          });
        const logsRef = await logsModel.where("type", "==", "taskRequests").get();
        let taskRequestLogs;
        logsRef.forEach((data) => {
          taskRequestLogs = data.data();
        });
        expect(taskRequestLogs).to.be.equal(undefined);
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
          .patch("/taskRequests")
          .set("cookie", `${cookieName}=${jwt}`)
          .query({ action: TASK_REQUEST_ACTIONS.APPROVE })
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

  describe("POST /taskRequests", function () {
    let fetchIssuesByIdStub;
    let fetchTaskStub;
    let createRequestStub;
    let getUsernameStub;
    const url = "/taskRequests";

    beforeEach(async function () {
      fetchIssuesByIdStub = sinon.stub(githubService, "fetchIssuesById");
      fetchTaskStub = sinon.stub(tasksModel, "fetchTask");
      createRequestStub = sinon.stub(taskRequestsModel, "createRequest");
      getUsernameStub = sinon.stub(usersUtils, "getUsername");
      getUsernameStub.resolves("abc");
      userId = await addUser({ ...member, id: "user123" });
      sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId }));
      jwt = authService.generateAuthToken({ userId });
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should create a task request successfully (Creation)", async function () {
      fetchIssuesByIdStub.resolves({ url: mockData.taskRequestData.externalIssueUrl });
      createRequestStub.resolves({
        id: "request123",
        taskRequest: mockData.existingTaskRequest,
        isCreate: true,
        alreadyRequesting: false,
      });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...mockData.taskRequestData, userId });
      expect(res).to.have.status(201);
      expect(res.body.message).to.equal("Task request successful.");
    });

    it("should allow users to request the same task (Creation)", async function () {
      fetchIssuesByIdStub.resolves({ url: mockData.taskRequestData.externalIssueUrl });
      createRequestStub.resolves({ id: "request123", taskRequest: mockData.existingTaskRequest, isCreate: false });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...mockData.taskRequestData, userId });
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Task request successful.");
    });

    it("should not allow users to request a issue which was previously approved (Creation)", async function () {
      fetchIssuesByIdStub.resolves({ url: mockData.taskRequestData.externalIssueUrl });
      createRequestStub.resolves({ isCreationRequestApproved: true });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...mockData.taskRequestData, userId });
      expect(res).to.have.status(409);
      expect(res.body.message).to.equal("Task exists for the given issue.");
    });

    it("should allow users to request the same task (Assignment)", async function () {
      const requestData = {
        ...mockData.taskRequestData,
        requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
        taskId: "abc",
        userId,
      };
      fetchTaskStub.resolves({ taskData: { ...taskData, id: requestData.taskId } });
      createRequestStub.resolves({ id: "request123", taskRequest: mockData.existingTaskRequest, isCreate: false });
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Task request successful.");
    });

    it("should handle invalid external issue URL", async function () {
      const requestData = {
        ...mockData.taskRequestData,
        externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website/atus/issues/1564672",
        userId,
      };
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res.body.message).to.equal("Issue does not exist");
      expect(res).to.have.status(400);
    });

    it("should handle valid external issue URL not is RDS repo", async function () {
      fetchIssuesByIdStub.resolves(null);
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...mockData.taskRequestData, userId });
      expect(res.body.message).to.equal("Issue does not exist");
      expect(res).to.have.status(400);
    });

    it("should handle task deadline before start date", async function () {
      const requestData = {
        ...mockData.taskRequestData,
        proposedStartDate: mockData.taskRequestData.proposedDeadline + 10000,
        userId,
      };
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res.body.message).to.equal("Task deadline cannot be before the start date");
      expect(res).to.have.status(400);
    });

    it("should handle user not authorized", async function () {
      const requestData = { ...mockData.taskRequestData, userId: "abc" };
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res.body.message).to.equal("Not authorized to create the request");
      expect(res).to.have.status(403);
    });

    it("should handle user not found", async function () {
      const requestData = { ...mockData.taskRequestData, userId };
      getUsernameStub.resolves(null);
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res.body.message).to.equal("User not found");
      expect(res).to.have.status(400);
    });

    it("should handle task not found (Assignment)", async function () {
      const requestData = {
        ...mockData.taskRequestData,
        taskId: "abc",
        requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
        userId,
      };
      fetchTaskStub.resolves({ taskData: null });
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("Task does not exist");
    });

    it("should save logs of successful requests", async function () {
      fetchIssuesByIdStub.resolves({ url: mockData.taskRequestData.externalIssueUrl });
      createRequestStub.resolves({
        id: "request123",
        taskRequest: mockData.existingTaskRequest,
        isCreate: true,
        alreadyRequesting: false,
      });
      await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ ...mockData.taskRequestData, userId });
      const logsRef = await logsModel.where("type", "==", "taskRequests").get();
      let taskRequestLogs;
      logsRef.forEach((data) => {
        taskRequestLogs = data.data();
      });
      expect(taskRequestLogs).to.not.be.equal(undefined);
      expect(taskRequestLogs.body).to.be.deep.equal(mockData.existingTaskRequest);
    });

    it("should not save logs of failed requests", async function () {
      const requestData = {
        ...mockData.taskRequestData,
        taskId: "abc",
        requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
      };
      fetchTaskStub.resolves({ taskData: null });
      await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).send(requestData);
      const logsRef = await logsModel.where("type", "==", "taskRequests").get();
      let taskRequestLogs;
      logsRef.forEach((data) => {
        taskRequestLogs = data.data();
      });
      expect(taskRequestLogs).to.be.equal(undefined);
    });
  });

  describe("POST /taskRequests/migrations", function () {
    const url = "/taskRequests/migrations";

    beforeEach(async function () {
      superUserId = await addUser(superUser);
      sinon.stub(authService, "verifyAuthToken").callsFake(() => ({ userId: superUserId }));
      jwt = authService.generateAuthToken({ userId: superUserId });
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should run the add new fields script when the appropriate query param is passed", async function () {
      const addNewFieldsStub = sinon
        .stub(taskRequestsModel, "addNewFields")
        .resolves({ documentsModified: 1, totalDocuments: 2 });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .query({ action: MIGRATION_TYPE.ADD_NEW_FIELDS });
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Task requests migration successful");
      expect(addNewFieldsStub.calledOnce).to.be.equal(true);
      expect(res.body.documentsModified).to.be.equal(1);
      expect(res.body.totalDocuments).to.be.equal(2);
    });

    it("should run the remove old fields script when the appropriate query param is passed", async function () {
      const removeOldFieldsStub = sinon
        .stub(taskRequestsModel, "removeOldField")
        .resolves({ documentsModified: 1, totalDocuments: 2 });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .query({ action: MIGRATION_TYPE.REMOVE_OLD_FIELDS });
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Task requests migration successful");
      expect(removeOldFieldsStub.calledOnce).to.be.equal(true);
      expect(res.body.documentsModified).to.be.equal(1);
      expect(res.body.totalDocuments).to.be.equal(2);
    });

    it("should run the add Users count and created at script when the appropriate query param is passed", async function () {
      const addsUsersCountCreatedStub = sinon
        .stub(taskRequestsModel, "addUsersCountAndCreatedAt")
        .resolves({ documentsModified: 1, totalDocuments: 2 });
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .query({ action: MIGRATION_TYPE.ADD_COUNT_CREATED });
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Task requests migration successful");
      expect(addsUsersCountCreatedStub.calledOnce).to.be.equal(true);
      expect(res.body.documentsModified).to.be.equal(1);
      expect(res.body.totalDocuments).to.be.equal(2);
    });

    it("should should handle any error thrown", async function () {
      sinon.stub(taskRequestsModel, "removeOldField").throws(new Error("Error message"));
      const res = await chai
        .request(app)
        .post(url)
        .set("cookie", `${cookieName}=${jwt}`)
        .query({ action: MIGRATION_TYPE.REMOVE_OLD_FIELDS });
      expect(res).to.have.status(500);
      expect(res.body.message).to.be.equal("An internal server error occurred");
    });

    it("should should invalid query param", async function () {
      const res = await chai.request(app).post(url).set("cookie", `${cookieName}=${jwt}`).query({ action: "abc" });
      expect(res).to.have.status(400);
      expect(res.body.message).to.be.equal("Unknown action");
    });
  });
});
