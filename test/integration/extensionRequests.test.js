const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const chaiHttp = require("chai-http");
const logsQuery = require("../../models/logs");
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
const { EXTENSION_REQUEST_STATUS } = require("../../constants/extensionRequests");
const { LOGS_FETCHED_SUCCESSFULLY } = require("../../constants/logs");

chai.use(chaiHttp);

const user = userData[6];
const appOwner = userData[3];
const superUser = userData[4];

let appOwnerjwt, superUserJwt, jwt, superUserId, extensionRequestId5;

describe("Extension Requests", function () {
  let taskId0,
    taskId1,
    taskId2,
    taskId3,
    taskId4,
    taskId5,
    taskId6,
    taskId7,
    extensionRequestId1,
    extensionRequestId2,
    extensionRequestId3,
    extensionRequestId4;

  before(async function () {
    const userId = await addUser(user);
    user.id = userId;
    const appOwnerUserId = await addUser(appOwner);
    appOwner.id = appOwnerUserId;
    superUserId = await addUser(superUser);
    appOwnerjwt = authService.generateAuthToken({ userId: appOwnerUserId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
    jwt = authService.generateAuthToken({ userId: userId });

    const taskData = [
      {
        title: "Test task 1",
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
      {
        title: "Test task for dev flag",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        participants: [],
        assignee: user.username,
        isNoteworthy: true,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
      {
        title: "Task with multiple requests",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        assignee: appOwner.username,
        isNoteworthy: true,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
      {
        title: "Task with pending request",
        type: "feature",
        endsOn: 1234,
        startedOn: 4567,
        status: "active",
        percentCompleted: 10,
        assignee: appOwner.username,
        isNoteworthy: true,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
      {
        title: "Test task 5",
        purpose: "To Test mocha",
        featureUrl: "<testUrl>",
        type: "group",
        links: ["test1"],
        endsOn: 1234,
        startedOn: 54321,
        status: "active",
        percentCompleted: 10,
        dependsOn: ["d12", "d23"],
        isNoteworthy: false,
        assignee: appOwner.username,
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
      },
    ];

    // Add the active task
    taskId0 = (await tasks.updateTask(taskData[0])).taskId;
    taskId1 = (await tasks.updateTask(taskData[1])).taskId;

    // Add the completed task
    taskId2 = (await tasks.updateTask(taskData[2])).taskId;

    // Add the completed task
    taskId3 = (await tasks.updateTask(taskData[3])).taskId;
    taskId4 = (await tasks.updateTask(taskData[4])).taskId;
    taskId5 = (await tasks.updateTask(taskData[5])).taskId;
    taskId6 = (await tasks.updateTask(taskData[6])).taskId;
    taskId7 = (await tasks.updateTask(taskData[7])).taskId;

    const extensionRequest = {
      taskId: taskId3,
      title: "change ETA",
      assignee: appOwner.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };
    const extensionRequest1 = {
      taskId: taskId2,
      title: "change ETA",
      assignee: appOwner.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "APPROVED",
    };

    const extensionRequest2 = {
      taskId: taskId3,
      title: "change ETA",
      assignee: user.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };

    const extensionRequest3 = {
      taskId: taskId3,
      title: "change ETA",
      assignee: user.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };

    const extensionRequest4 = {
      taskId: taskId4,
      title: "change ETA",
      assignee: user.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };
    const extensionRequest5 = {
      taskId: taskId7,
      title: "change ETA",
      assignee: user.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "APPROVED",
    };

    const extensionRequest6 = {
      taskId: taskId6,
      title: "change ETA",
      assignee: user.id,
      oldEndsOn: 1234,
      newEndsOn: 1235,
      reason: "family event",
      status: "PENDING",
    };
    extensionRequestId1 = (await extensionRequests.createExtensionRequest(extensionRequest)).id;
    extensionRequestId2 = (await extensionRequests.createExtensionRequest(extensionRequest1)).id;
    extensionRequestId3 = (await extensionRequests.createExtensionRequest(extensionRequest2)).id;
    extensionRequestId4 = (await extensionRequests.createExtensionRequest(extensionRequest3)).id;
    extensionRequestId5 = (await extensionRequests.createExtensionRequest(extensionRequest4)).id;
    await extensionRequests.createExtensionRequest(extensionRequest5);
    await extensionRequests.createExtensionRequest(extensionRequest6);
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("GET /extension-requests/self", function () {
    it("should return success response and extension request of the authenticated user", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0].assignee).to.equal(appOwner.username);
          expect([extensionRequestId1, extensionRequestId2]).contains(res.body.allExtensionRequests[0].id);
          expect([extensionRequestId1, extensionRequestId2]).contains(res.body.allExtensionRequests[1].id);
          expect(res.body.allExtensionRequests[1].assignee).to.equal(appOwner.username);
          return done();
        });
    });

    it("should return success response and all extension requests with query params", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId2, status: "APPROVED" })
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0].assignee).to.equal(appOwner.username);
          expect(res.body.allExtensionRequests[0].id).to.equal(extensionRequestId2);
          return done();
        });
    });

    it("should return success response and an empty array of extensionRequest if assignee is not same as latest one", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId7 })
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array").with.lengthOf(0);
          return done();
        });
    });

    it("should return success response and a single latestExtensionRequest if assignee same as latest one", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId2 })
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array").with.lengthOf(1);
          return done();
        });
    });

    it("Should return 401 if not logged in", function (done) {
      chai
        .request(app)
        .get("/extension-requests/self")
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("POST /extension-requests - creates a new extension requests", function () {
    it("Should return success response after adding the extension request", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          expect(res.body.extensionRequest).to.be.a("object");
          expect(res.body.extensionRequest.assignee).to.equal(appOwner.id);
          expect(res.body.extensionRequest.status).to.equal(EXTENSION_REQUEST_STATUS.PENDING);
          return done();
        });
    });

    it("Should return success response after adding the extension request (sending assignee username)", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .send({
          taskId: taskId0,
          title: "change ETA",
          assignee: appOwner.username,
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
          expect(res.body.extensionRequest).to.be.a("object");
          expect(res.body.extensionRequest.assignee).to.equal(appOwner.id);
          expect(res.body.extensionRequest.status).to.equal(EXTENSION_REQUEST_STATUS.PENDING);
          return done();
        });
    });

    it("Should return failure response after adding the extension request (sending wrong assignee info)", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .send({
          taskId: taskId0,
          title: "change ETA",
          assignee: "hello",
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
          expect(res.body.message).to.equal("User Not Found");
          return done();
        });
    });

    it("Should return fail response if someone try to create a extension request for someone else and is not a super user", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          expect(res.body.message).to.equal(
            "Only assigned user and super user can create an extension request for this task."
          );
          return done();
        });
    });

    it("Should return fail response if task with the taskId doesn't exists", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          expect(res.body.message).to.equal("Task Not Found");
          return done();
        });
    });

    it("Should return fail response if task belongs to someone else", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          expect(res.body.message).to.equal("This task is assigned to some different user.");
          return done();
        });
    });

    it("Should return fail response if the new ETA falls before old ETA", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          expect(res.body.message).to.equal("New ETA must be greater than Old ETA");
          return done();
        });
    });

    it("should create a new extension request when no previous extension request exists and make the requestNumber to 1", async function () {
      const requestData = {
        taskId: taskId5,
        title: "change ETA",
        assignee: appOwner.id,
        oldEndsOn: 1234,
        newEndsOn: 1235,
        reason: "family event",
        status: "PENDING",
      };

      const res = await chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .send(requestData);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Extension Request created successfully!");

      expect(res.body.extensionRequest.requestNumber).to.be.equal(1);
      expect(res.body.extensionRequest).to.be.an("object");
    });

    it("should handle the case when a previous extension request is pending so api should not allow and throw a proper message", async function () {
      const requestData = {
        taskId: taskId6,
        title: "change ETA",
        assignee: appOwner.id,
        oldEndsOn: 1235,
        newEndsOn: 1236,
        reason: "family event",
        status: "PENDING",
      };

      const res = await chai
        .request(app)
        .post("/extension-requests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
        .send(requestData);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("An extension request for this task already exists.");
    });

    it("Should return success response after adding the extension request and also there should be a log for the same", function (done) {
      chai
        .request(app)
        .post("/extension-requests")
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
          const extensionRequestId1 = res.body.extensionRequest.id;
          chai
            .request(app)
            .get(`/logs/extensionRequests/?body.assignee=${user.id}&meta.taskId=${taskId2}`)
            .set("cookie", `${cookieName}=${superUserJwt}`)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res).to.have.status(200);
              expect(res.body).to.be.a("object");
              expect(res.body.message).to.equal(LOGS_FETCHED_SUCCESSFULLY);
              expect(res.body.logs).to.be.a("array");
              expect(res.body.logs[0].body.extensionRequestId).to.equal(extensionRequestId1);
              expect(res.body.logs[0].body.assignee).to.equal(user.id);
              expect(res.body.logs[0].body.status).to.equal(EXTENSION_REQUEST_STATUS.PENDING);
              expect(res.body.logs[0].meta.taskId).to.equal(taskId2);
              return done();
            });
          // eslint-disable-next-line
          return;
        });
    });
  });

  describe("GET /extension-requests/:id", function () {
    it("should return success response and extension request with the id that is provided", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/${extensionRequestId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.extensionRequest).to.be.a("object");
          expect(res.body.extensionRequest.assignee).to.equal(appOwner.username);
          expect(res.body.extensionRequest.id).to.equal(extensionRequestId1);
          return done();
        });
    });

    it("should return failure response if no extension request found with :id", function (done) {
      chai
        .request(app)
        .get(`/extension-requests/1234567890`)
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

  describe("GET /extension-requests", function () {
    it("should return success response and all extension requests", function (done) {
      chai
        .request(app)
        .get(`/extension-requests`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0]).to.have.property("assignee");
          expect(res.body.allExtensionRequests[0]).to.have.property("id");
          return done();
        });
    });

    it("should return success response and all extension requests with query params", function (done) {
      chai
        .request(app)
        .get(`/extension-requests`)
        .query({ q: `assignee:${appOwner.id},taskId:${taskId3}` })
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0].assignee).to.equal(appOwner.username);
          expect(res.body.allExtensionRequests[0].id).to.equal(extensionRequestId1);
          return done();
        });
    });

    it("Should return paginated response when size is passed", function (done) {
      const fetchPaginatedExtensionRequestStub = sinon.stub(extensionRequests, "fetchPaginatedExtensionRequests");
      chai
        .request(app)
        .get("/extension-requests?size=10")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(fetchPaginatedExtensionRequestStub.calledOnce).to.be.equal(true);

          return done();
        });
    });

    it("Should have the link to get next set of results", function (done) {
      chai
        .request(app)
        .get(`/extension-requests?size=10`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("next");
          return done();
        });
    });

    it("Should get all extension requests filtered with status when multiple params are passed", function (done) {
      chai
        .request(app)
        .get(`/extension-requests?q=status:${EXTENSION_REQUEST_STATUS.APPROVED}+${EXTENSION_REQUEST_STATUS.PENDING}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension Requests returned successfully!");
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body).to.have.property("next");

          const extensionRequestsList = res.body.allExtensionRequests ?? [];
          extensionRequestsList.forEach((extensionReq) => {
            expect(extensionReq.status).to.be.oneOf([
              EXTENSION_REQUEST_STATUS.APPROVED,
              EXTENSION_REQUEST_STATUS.PENDING,
            ]);
          });
          return done();
        });
    });
  });

  describe("PATCH /extension-requests/:id/status", function () {
    it("Should return 401 if someone other than superuser logged in", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}/status`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "You are not authorized for this action.",
          });

          return done();
        });
    });

    it("Should update the extensionRequest status for the given extensionRequestId", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}/status`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "APPROVED",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension request APPROVED succesfully");
          expect(res.body.extensionLog.type).to.equal("extensionRequests");
          expect(res.body.extensionLog.body.status).to.equal("APPROVED");

          chai
            .request(app)
            .get(`/tasks/${taskId3}/details`)
            .set("cookie", `${cookieName}=${superUserJwt}`)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res).to.have.status(200);
              expect(res.body).to.be.a("object");
              expect(res.body.message).to.equal("task returned successfully");
              expect(res.body.taskData.endsOn).to.equal(1235);

              return done();
            });

          return null;
        });
    });

    it('Should return 400 if payload has anything other than "status" to update extensionRequest', function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}/status`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          title: "Hello World",
          status: "APPROVED",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal('"title" is not allowed');
          return done();
        });
    });

    it('Should return 400 if payload doesn\'t have "status" to update extensionRequest', function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}/status`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          title: "Hello World",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal('"status" is required');
          return done();
        });
    });
  });

  describe("PATCH /extension-requests/:id", function () {
    it("Should return 401 if someone other than superuser logged in", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "You are not authorized for this action.",
          });

          return done();
        });
    });

    it("Should update the extensionRequest for the given extensionRequestId", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);
          return done();
        });
    });

    it("User should be able to update the extensionRequest for the given extensionRequestId", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId4}?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(204);
          return done();
        });
    });

    it("User should not be able to update the extensionRequest if already approved", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          return done();
        });
    });

    it("Super user should not be able to update the extensionRequest if already approved", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          title: "new-title",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          return done();
        });
    });

    it("Should return 400 if assignee of the extensionrequest is upated with a different user", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          assignee: user.id,
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

    it('Should return 400 if payload has "status" to update extensionRequest', function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "APPROVED",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal('"status" is not allowed');
          return done();
        });
    });

    it("Extension request log should contain extensionRequestId upon approving", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId3}/status`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "APPROVED",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension request APPROVED succesfully");
          expect(res.body.extensionLog.type).to.equal("extensionRequests");
          expect(res.body.extensionLog.body.status).to.equal("APPROVED");

          chai
            .request(app)
            .get(`/logs/extensionRequests?body.status=APPROVED&meta.extensionRequestId=${extensionRequestId3}`)
            .set("cookie", `${cookieName}=${superUserJwt}`)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.logs[0].body.status).to.equal("APPROVED");
              expect(res.body.logs[0].meta.extensionRequestId).to.equal(extensionRequestId3);

              return done();
            });

          return null;
        });
    });

    it("Extension request log should contain extensionRequestId upon denying request", function (done) {
      chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId4}/status`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "DENIED",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Extension request DENIED succesfully");
          expect(res.body.extensionLog.type).to.equal("extensionRequests");
          expect(res.body.extensionLog.body.status).to.equal("DENIED");

          chai
            .request(app)
            .get(`/logs/extensionRequests?body.status=DENIED&meta.extensionRequestId=${extensionRequestId4}`)
            .set("cookie", `${cookieName}=${superUserJwt}`)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.logs[0].body.status).to.equal("DENIED");
              expect(res.body.logs[0].meta.extensionRequestId).to.equal(extensionRequestId4);

              return done();
            });

          return null;
        });
    });
  });

  describe("Updating extension request detail", function () {
    it("Should create a log when SU changes the extension request's title", async function () {
      const newTitle = "new-title";
      const oldTitle = "change ETA";
      await chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId5}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          title: newTitle,
        });
      const logs = await logsQuery.fetchLogs({ "meta.extensionRequestId": extensionRequestId5 }, "extensionRequests");
      const updationLogs = logs.find(
        (log) => log.meta.userId === superUserId && log.body.newTitle === newTitle && log.body.oldTitle === oldTitle
      );
      expect(updationLogs.meta.extensionRequestId).to.equal(extensionRequestId5);
      expect(updationLogs.body.newTitle).to.equal(newTitle);
      expect(updationLogs.body.oldTitle).to.equal(oldTitle);
      return null;
    });

    it("Should create a log when SU changes the extension request's ETA", async function () {
      const usersETA = 1235;
      const suETA = 4444; // from above
      await chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId5}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          newEndsOn: suETA,
        });
      const logs = await logsQuery.fetchLogs({ "meta.extensionRequestId": extensionRequestId5 }, "extensionRequests");
      const updationLogs = logs.find(
        (log) => log.meta.userId === superUserId && log.body.newEndsOn === suETA && log.body.oldEndsOn === usersETA
      );
      expect(updationLogs.meta.extensionRequestId).to.equal(extensionRequestId5);
      expect(updationLogs.body.newEndsOn).to.equal(suETA);
      expect(updationLogs.body.oldEndsOn).to.equal(usersETA);
      return null;
    });

    it("Should create a log when SU changes the extension request's reason", async function () {
      const newReason = "office work";
      const oldReason = "family event"; // from above
      await chai
        .request(app)
        .patch(`/extension-requests/${extensionRequestId5}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          reason: newReason,
        });
      const logs = await logsQuery.fetchLogs({ "meta.extensionRequestId": extensionRequestId5 }, "extensionRequests");
      const updationLogs = logs.find(
        (log) => log.meta.userId === superUserId && log.body.newReason === newReason && log.body.oldReason === oldReason
      );
      expect(updationLogs.meta.extensionRequestId).to.equal(extensionRequestId5);
      expect(updationLogs.body.newReason).to.equal(newReason);
      expect(updationLogs.body.oldReason).to.equal(oldReason);
      return null;
    });
  });
});
