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

describe("Multiple Extension Requests", function () {
  let taskId0, taskId1, taskId2, taskId3, extensionRequestId1, extensionRequestId2;

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
    ];

    // Add the active task
    taskId0 = (await tasks.updateTask(taskData[0])).taskId;
    taskId1 = (await tasks.updateTask(taskData[1])).taskId;

    // Add the completed task
    taskId2 = (await tasks.updateTask(taskData[2])).taskId;

    // Add the completed task
    taskId3 = (await tasks.updateTask(taskData[3])).taskId;

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


  describe('POST /extension-requests - allows the creation of extension request', () => {
    // Stub the extensionRequestsQuery.fetchLatestExtensionRequest method
    let fetchLatestExtensionRequestStub;
  
    beforeEach(() => {
      // Create a Sinon sandbox
      fetchLatestExtensionRequestStub = sinon.stub(extensionRequests, 'fetchLatestExtensionRequest');
    });
  
    afterEach(() => {
      // Restore the stub after each test
      fetchLatestExtensionRequestStub.restore();
    });

    it("Should return success response after adding the extension request (sending assignee username)", function (done) {
      fetchLatestExtensionRequestStub.returns([]);
      chai
        .request(app)
        .post("/extension-requests/?dev=true")
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
        .post("/extension-requests/?dev=true")
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
          expect(res.body.message).to.equal("User with this id or username doesn't exist.");
          return done();
        });
    });
    it("Should return fail response if someone try to create a extension request for someone else and is not a super user", function (done) {
      chai
        .request(app)
        .post("/extension-requests/?dev=true")
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
        .post("/extension-requests/?dev=true")
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
        .post("/extension-requests?dev=true")
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
  
    it('should create a new extension request when dev flag is true and no previous extension request exists and make the requestNumber to 1', async () => {
      // Arrange
      fetchLatestExtensionRequestStub.returns([]);
  
      const requestData = {
        taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING"
      };
  
      const res = await chai.request(app)
        .post('/extension-requests?dev=true')
        .set('cookie', `${cookieName}=${appOwnerjwt}`)
        .send(requestData);
  
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Extension Request created successfully!');

      expect(res.body.extensionRequest.requestNumber).to.be.equal(1);
      expect(res.body.extensionRequest).to.be.an('object');
      // Verify that fetchLatestExtensionRequestStub was called once
      sinon.assert.calledOnce(fetchLatestExtensionRequestStub);
    });
  
    it('should handle the case when a previous extension request is pending so api should not allow and throw a proper message', async () => {
      fetchLatestExtensionRequestStub.returns([
        {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1235,
          reason: "family event",
          status: "PENDING",
        },
      ]);
  
      const requestData = {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1235,
          newEndsOn: 1236,
          reason: "family event",
          status: "PENDING"
      };
  
      const res = await chai.request(app)
        .post('/extension-requests?dev=true')
        .set('cookie', `${cookieName}=${appOwnerjwt}`)
        .send(requestData);
  
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("An extension request for this task already exists.");
      sinon.assert.calledOnce(fetchLatestExtensionRequestStub);
    });

    it('should handle the case when a previous extension request is approved and fail if newETA<oldETA', async () => {
      let requestData = {
        taskId: taskId1,
        title: "change ETA",
        assignee: "mayur",
        oldEndsOn: 1235,
        newEndsOn: 1236,
        reason: "family event",
        status: "PENDING"
    };

    let res = await chai.request(app)
      .post('/extension-requests?dev=true')
      .set('cookie', `${cookieName}=${appOwnerjwt}`)
      .send(requestData);

      fetchLatestExtensionRequestStub.returns([
        {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1235,
          newEndsOn: 1236,
          reason: "family event",
          status: "APPROVED",
        },
      ]);
      

       requestData = {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1236,
          //fail as newETA<oldETA
          newEndsOn: 1230,
          reason: "family event",
          status: "PENDING"
      };
       res = await chai.request(app)
        .post('/extension-requests?dev=true')
        .set('cookie', `${cookieName}=${appOwnerjwt}`)
        .send(requestData);
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("The value for newEndsOn should be greater than the previous ETA"/* Expected error message or response message */);
      //sinon.assert.calledOnce(fetchLatestExtensionRequestStub);
    });

    it('should handle the case when a previous extension request is denied and fail if newETA>oldETA', async () => {

      let requestData = {
        taskId: taskId1,
        title: "change ETA",
        assignee: appOwner.id,
        oldEndsOn: 1234,
        newEndsOn: 1237,
        reason: "family event",
        status: "PENDING"
    };

    let res = await chai.request(app)
      .post('/extension-requests?dev=true')
      .set('cookie', `${cookieName}=${appOwnerjwt}`)
      .send(requestData);

      fetchLatestExtensionRequestStub.returns([
        {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          newEndsOn: 1237,
          reason: "family event",
          status: "DENIED",
          requestNumber : 5
        },
      ]);
      

       requestData = {
          taskId: taskId1,
          title: "change ETA",
          assignee: appOwner.id,
          oldEndsOn: 1234,
          //making it fail it here because previousExtension is denied so newEndsOn should be > fetchLatestExtensionRequestStub.oldEndsOn
          newEndsOn: 1230,
          reason: "family event",
          status: "PENDING"
      };
  
       res = await chai.request(app)
        .post('/extension-requests?dev=true')
        .set('cookie', `${cookieName}=${appOwnerjwt}`)
        .send(requestData);
  
      // Assert
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("The value for newEndsOn should be greater than the previous ETA"/* Expected error message or response message */);
      sinon.assert.calledOnce(fetchLatestExtensionRequestStub);
    });
  
  });


  describe("GET /extension-requests/self **when dev flag is true**", function () {

    beforeEach(() => {
      // Create a Sinon sandbox
      fetchLatestExtensionRequestStub = sinon.stub(extensionRequests, 'fetchLatestExtensionRequest');
    });
  
    afterEach(() => {
      // Restore the stub after each test
      fetchLatestExtensionRequestStub.restore();
    });

    
    it("Dev-flag true->should return success response and an empty array of extensionRequest if assignee is not same as latest one", function (done) {
      fetchLatestExtensionRequestStub.returns([
        {
          taskId: taskId2,
          title: "change ETA",
          assignee: "mayur",
          oldEndsOn: 1234,
          newEndsOn: 1237,
          reason: "family event",
          status: "APPROVED",
          requestNumber : 5,
          userId:"ajdf"
        }
      ]);
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId2,dev:"true" })
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

    it("Dev-flag true->should return success response and an  array of single extensionRequest if assignee same as latest one", function (done) {
      fetchLatestExtensionRequestStub.returns([
        {
          taskId: taskId2,
          title: "change ETA",
          assignee: "mayur",
          oldEndsOn: 1234,
          newEndsOn: 1237,
          reason: "family event",
          status: "APPROVED",
          requestNumber : 5,
          userId:appOwner.id
        }
      ]);
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId2,dev:"true" })
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

    it("Should return 401 if not logged in **when dev=true**", function (done) {
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


});
