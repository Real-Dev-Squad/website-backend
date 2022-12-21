const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const extensionRequests = require("../../models/extensionRequests");
const tasks = require("../../models/tasks");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const config = require("config");
const cookieName = config.get("userToken.cookieName");
const userData = require("../fixtures/user/user")();
const { DINERO, NEELAM } = require("../../constants/wallets");
const cleanDb = require("../utils/cleanDb");
const { ETA_EXTENSION_REQUEST_STATUS } = require("../../constants/extensionRequests");

chai.use(chaiHttp);

const user = userData[2];
const appOwner = userData[3];
const superUser = userData[4];

let jwt, superUserJwt;

describe("Extension Requests", function () {
  let taskId1, taskId2, taskId3, extensionRequestId, taskId;

  before(async function () {
    const userId = await addUser(user);
    user.id = userId;
    const appOwnerUserId = await addUser(appOwner);
    appOwner.id = appOwnerUserId;
    const superUserId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId: appOwnerUserId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });

    const taskData = [
      {
        title: "Test task",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        participants: [],
        assignee: appOwner.username,
        isNoteworthy: true,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
      {
        title: "Test task",
        purpose: "To Test mocha",
        featureUrl: "<testUrl>",
        type: "group",
        links: ["test1"],
        endsOn: 1234,
        startedOn: 54321,
        status: "completed",
        percentCompleted: 10,
        dependsOn: ["d12", "d23"],
        participants: [],
        isNoteworthy: false,
        assignee: user.username,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
      {
        title: "Test task",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        participants: [],
        assignee: appOwner.username,
        isNoteworthy: true,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
    ];

    // Add the active task
    taskId = (await tasks.updateTask(taskData[0])).taskId;
    taskId1 = taskId;

    // Add the completed task
    taskId = (await tasks.updateTask(taskData[1])).taskId;
    taskId2 = taskId;

    // Add the completed task
    taskId = (await tasks.updateTask(taskData[2])).taskId;
    taskId3 = taskId;

    const extensionRequest = {
      taskId: taskId3,
      title: "change ETA",
      assignee: appOwner.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };
    extensionRequestId = (await extensionRequests.createExtensionRequest(extensionRequest)).id;
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("POST /extensionRequest - creates a new extension requests", function () {
    it("Should return success response after adding the extension request", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension Request created successfully!");
          expect(res.body.extensionRequestData).to.be.a("object");
          expect(res.body.extensionRequestData.assignee).to.equal(appOwner.id);
          expect(res.body.extensionRequestData.status).to.equal(ETA_EXTENSION_REQUEST_STATUS.PENDING);
          return done();
        });
    });
    it("Should return fail response if someone try to create a extension request for someone else and is not a super user", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: taskId2,
          title: "change ETA",
          assignee: user.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Only Super User can create an extension request for this task.");
          return done();
        });
    });
    it("Should return fail response if task with the taskId doesn't exists", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: "12345678",
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Task with taskId doesn't exist");
          return done();
        });
    });
    it("Should return fail response if task belongs to someone else", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: taskId2,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("This task is assigned to some different user");
          return done();
        });
    });
    it("Should return fail response if the new ETA is invalid", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 0,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("The value for newEndsOn should be greater than the previous ETA");
          return done();
        });
    });
    it("Should return fail response if extension request for a task already exists", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          taskId: taskId3,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(403);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("An extension request for this task already exists.");
          return done();
        });
    });
    it("Should return success response after adding the extension request and also there should be a log for the same", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          taskId: taskId2,
          title: "change ETA",
          assignee: user.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension Request created successfully!");
          const extensionRequestId = res.body.extensionRequestData.id;
          chai
            .request(app)
            .get(`/logs/extensionRequest/?body.assignee=${user.id}&meta.taskId=${taskId2}`)
            .set("cookie", `${cookieName}=${superUserJwt}`)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res).to.have.status(200);
              expect(res.body).to.be.a("object");
              expect(res.body.message).to.equal("Logs returned successfully!");
              expect(res.body.logs).to.be.a("array");
              expect(res.body.logs[0].body.extensionRequestId).to.equal(extensionRequestId);
              expect(res.body.logs[0].body.assignee).to.equal(user.id);
              expect(res.body.logs[0].meta.taskId).to.equal(taskId2);
              return done();
            });
          // eslint-disable-next-line
          return;
        });
    });
  });

  describe("GET /extensionRequest/:id", function () {
    it("should return success response and extension request with the id that is provided", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests/${extensionRequestId}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.extensionRequestData).to.be.a("object");
          expect(res.body.extensionRequestData.assignee).to.equal(appOwner.username);
          expect(res.body.extensionRequestData.id).to.equal(extensionRequestId);
          return done();
        });
    });
    it("should return failure response if no extension request found with :id", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests/1234567890`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Request not found");
          return done();
        });
    });
  });

  describe("GET /extensionRequest", function () {
    it("should return success response and all extension requests", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.extensionRequestData).to.be.a("array");
          expect(res.body.extensionRequestData[0]).to.have.property("assignee");
          expect(res.body.extensionRequestData[0]).to.have.property("id");
          return done();
        });
    });

    it("should return success response and all extension requests with query params", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests`)
        .query({ taskId: taskId3, assignee: appOwner.id })
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.extensionRequestData).to.be.a("array");
          expect(res.body.extensionRequestData[0].assignee).to.equal(appOwner.username);
          expect(res.body.extensionRequestData[0].id).to.equal(extensionRequestId);
          return done();
        });
    });
  });
});
