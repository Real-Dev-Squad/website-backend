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
const { EXTENSION_REQUEST_STATUS } = require("../../constants/extensionRequests");

chai.use(chaiHttp);

const user = userData[6];
const appOwner = userData[3];
const superUser = userData[4];

let appOwnerjwt, superUserJwt, jwt;

describe("Extension Requests", function () {
  let taskId1, taskId2, taskId3, extensionRequestId1, extensionRequestId2;

  before(async function () {
    const userId = await addUser(user);
    user.id = userId;
    const appOwnerUserId = await addUser(appOwner);
    appOwner.id = appOwnerUserId;
    const superUserId = await addUser(superUser);
    appOwnerjwt = authService.generateAuthToken({ userId: appOwnerUserId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
    jwt = authService.generateAuthToken({ userId: userId });

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
    taskId1 = (await tasks.updateTask(taskData[0])).taskId;

    // Add the completed task
    taskId2 = (await tasks.updateTask(taskData[1])).taskId;

    // Add the completed task
    taskId3 = (await tasks.updateTask(taskData[2])).taskId;

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
    extensionRequestId1 = (await extensionRequests.createExtensionRequest(extensionRequest)).id;
    extensionRequestId2 = (await extensionRequests.createExtensionRequest(extensionRequest1)).id;
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("GET /extensionRequest/self", function () {
    it("should return success response and extension request of the authenticated user", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests/self`)
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
        .get(`/extensionRequests/self`)
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

    it("Should return 401 if not logged in", function (done) {
      chai
        .request(app)
        .get("/extensionRequests/self")
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

  describe("POST /extensionRequest - creates a new extension requests", function () {
    it("Should return success response after adding the extension request", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
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
    it("Should return fail response if someone try to create a extension request for someone else and is not a super user", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
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
          expect(res.body.message).to.equal("Only Super User can create an extension request for this task.");
          return done();
        });
    });
    it("Should return fail response if task with the taskId doesn't exists", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
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
          expect(res.body.message).to.equal("Task with this id or taskid doesn't exist.");
          return done();
        });
    });
    it("Should return fail response if task belongs to someone else", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
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
          expect(res.body.message).to.equal("This task is assigned to some different user");
          return done();
        });
    });
    it("Should return fail response if the new ETA falls before old ETA", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
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
          expect(res.body.message).to.equal("The value for newEndsOn should be greater than the previous ETA");
          return done();
        });
    });
    it("Should return fail response if extension request for a task already exists", function (done) {
      chai
        .request(app)
        .post("/extensionRequests")
        .set("cookie", `${cookieName}=${appOwnerjwt}`)
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
          const extensionRequestId1 = res.body.extensionRequest.id;
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
              expect(res.body.logs[0].body.extensionRequestId).to.equal(extensionRequestId1);
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
        .get(`/extensionRequests/${extensionRequestId1}`)
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
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0]).to.have.property("assignee");
          expect(res.body.allExtensionRequests[0]).to.have.property("id");
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
          expect(res.body.allExtensionRequests).to.be.a("array");
          expect(res.body.allExtensionRequests[0].assignee).to.equal(appOwner.username);
          expect(res.body.allExtensionRequests[0].id).to.equal(extensionRequestId1);
          return done();
        });
    });

    it("Should return 401 if someone other than superuser logged in", function (done) {
      chai
        .request(app)
        .get(`/extensionRequests`)
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
  });

  describe("PATCH /extensionRequest/:id/status", function () {
    it("Should return 401 if someone other than superuser logged in", function (done) {
      chai
        .request(app)
        .patch(`/extensionRequests/${extensionRequestId1}/status`)
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
        .patch(`/extensionRequests/${extensionRequestId1}/status`)
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
          expect(res.body.extensionLog.type).to.equal("extensionRequest");
          expect(res.body.extensionLog.body.subType).to.equal("update");
          expect(res.body.extensionLog.body.new.status).to.equal("APPROVED");

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
        .patch(`/extensionRequests/${extensionRequestId1}/status`)
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
        .patch(`/extensionRequests/${extensionRequestId1}/status`)
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

  describe("PATCH /extensionRequest/:id", function () {
    it("Should return 401 if someone other than superuser logged in", function (done) {
      chai
        .request(app)
        .patch(`/extensionRequests/${extensionRequestId1}`)
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
        .patch(`/extensionRequests/${extensionRequestId1}`)
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

    it("Should return 400 if assignee of the extensionrequest is upated with a different user", function (done) {
      chai
        .request(app)
        .patch(`/extensionRequests/${extensionRequestId1}`)
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
        .patch(`/extensionRequests/${extensionRequestId1}`)
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
  });
});
