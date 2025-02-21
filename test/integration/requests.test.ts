import chai from "chai";
const { expect } = chai;
import chaiHttp from "chai-http";
import _ from "lodash";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
const cookieName = config.get("userToken.cookieName");
import addUser from "../utils/addUser";
import {
  createOooRequests,
  validOooStatusRequests,
  validOooStatusUpdate,
  createOooRequests2,
} from "../fixtures/oooRequest/oooRequest";
import { createRequest, updateRequest } from "../../models/requests";
import {
  REQUEST_ALREADY_APPROVED,
  REQUEST_STATE,
  REQUEST_TYPE,
  REQUEST_APPROVED_SUCCESSFULLY,
  REQUEST_CREATED_SUCCESSFULLY,
  REQUEST_DOES_NOT_EXIST,
  REQUEST_ALREADY_PENDING,
  REQUEST_REJECTED_SUCCESSFULLY,
  REQUEST_ALREADY_REJECTED,
} from "../../constants/requests";
import { updateTask } from "../../models/tasks";
import { validTaskAssignmentRequest, validTaskCreqtionRequest } from "../fixtures/taskRequests/taskRequests";

const userData = userDataFixture();
chai.use(chaiHttp);

let authToken: string;
let superUserToken: string;
let oooRequestId: string;
let pendingOooRequestId: string;
let approvedOooRequestId: string;
let oooRequestData: any;
let oooRequestData2: any;
let testUserId: string;

describe("/requests OOO", function () {
  beforeEach(async function () {
    const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
    const [userId, superUserId] = await Promise.all(userIdPromises);
    testUserId = userId;

    oooRequestData = { ...createOooRequests, requestedBy: userId };
    oooRequestData2 = { ...createOooRequests2, requestedBy: superUserId };

    const { id: oooRequestStatusId }: any = await createRequest(oooRequestData);
    oooRequestId = oooRequestStatusId;
    const { id: pendingOooId }: any = await createRequest(oooRequestData2);
    pendingOooRequestId = pendingOooId;

    const response = await updateRequest(
      oooRequestId,
      { state: REQUEST_STATE.APPROVED },
      superUserId,
      REQUEST_TYPE.OOO
    );
    approvedOooRequestId = response?.id;

    authToken = authService.generateAuthToken({ userId });
    superUserToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /requests", function () {
    beforeEach(async function () {
      const userIdPromises = [addUser(userData[16])];
      const [userId] = await Promise.all(userIdPromises);

      authToken = authService.generateAuthToken({ userId });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .post("/requests")
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should create a new request", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should return 400, if already created request is created again", async function () {
      await chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests);
      const response = await chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests);
      expect(response).to.have.status(201);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
    });

    it("should create a new request and have all the required fields in the response", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(Object.keys(res.body.data)).to.have.lengthOf(9);
          expect(res.body.data.until).to.be.above(res.body.data.from);
          expect(res.body.data).to.have.property("requestedBy");
          expect(res.body.data.type).to.equal(REQUEST_TYPE.OOO);
          expect(res.body.data.state).to.equal(REQUEST_STATE.PENDING);
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should create a new request", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(validOooStatusRequests)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_CREATED_SUCCESSFULLY);
          done();
        });
    });

    it("should return error if invalid type is passed", function (done) {
      const type = "ACTIVE";
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...validOooStatusRequests, type })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(`Invalid request type: ${type}`);
          done();
        });
    });

    it("should return error if message is not present in body", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send(_.omit(validOooStatusRequests, "message"))
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("message is required");
          done();
        });
    });

    it("should return error if state in the body is not PENDING", function (done) {
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${authToken}`)
        .send({ ...validOooStatusRequests, state: REQUEST_STATE.APPROVED })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("state must be PENDING");
          done();
        });
    });
  });

  describe("PUT /requests/:id", function () {
    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .put(`/requests/${oooRequestId}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should approved a request", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_APPROVED_SUCCESSFULLY);
          done();
        });
    });

    it("should return error if wrong type is passed", function (done) {
      const type = "ACTIVE";
      chai
        .request(app)
        .put(`/requests/${pendingOooRequestId}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send({ ...validOooStatusUpdate, type })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal('"type" must be one of [OOO, EXTENSION, ONBOARDING]');
          done();
        });
    });

    it("should return 404 if request does not exist", function (done) {
      chai
        .request(app)
        .put(`/requests/invalidoooRequestId`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
          done();
        });
    });

    it("should return 400 if request is already approved", function (done) {
      chai
        .request(app)
        .put(`/requests/${approvedOooRequestId}`)
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send(validOooStatusUpdate)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_ALREADY_APPROVED);
          done();
        });
    });
  });

  describe("GET /requests", function () {
    it("should return all requests", function (done) {
      chai
        .request(app)
        .get("/requests")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(2);
          expect(res.body.data[0]).to.have.property("id");
          expect(res.body.data[0]).to.have.property("requestedBy");
          expect(res.body.data[0]).to.have.property("type");
          expect(res.body.data[0]).to.have.property("state");
          expect(res.body.data[0]).to.have.property("message");
          done();
        });
    });

    it("should return the request by Id query", function (done) {
      chai
        .request(app)
        .get(`/requests?id=${oooRequestId}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.id === oooRequestId);
          done();
        });
    });

    it("should return all requests by specific user", function (done) {
      chai
        .request(app)
        .get(`/requests?requestedBy=${userData[16].username}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((request: any) => request.requestedBy === testUserId));
          done();
        });
    });

    it("should return all requests by specific user and state", function (done) {
      chai
        .request(app)
        .get(`/requests?state=APPROVED&requestedBy=${userData[16].username}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((e: any) => e.state === "APPROVED"));
          expect(res.body.data.every((e: any) => e.requestedBy === testUserId));
          done();
        });
    });

    it("should return request of type OOO", function (done) {
      chai
        .request(app)
        .get("/requests?type=OOO")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.data.every((e: any) => e.type === "OOO"));
          done();
        });
    });

    it("should return empty array is no data is found, for specific state and user", function (done) {
      chai
        .request(app)
        .get("/requests?requestedBy=testUser2&state=APPROVED")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should return empty array is no data is found", function (done) {
      chai
        .request(app)
        .get("/requests?requestedBy=testUserRandom")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should throw error if request id doesn't match", function (done) {
      chai
        .request(app)
        .get("/requests?id=ramdonId1")
        .end(function (err, res) {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("should return error if not a valid state is passed", function (done) {
      chai
        .request(app)
        .get("/requests?state=ACTIVE")
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal(`"state" must be one of [APPROVED, PENDING, REJECTED]`);
          done();
        });
    });

    it("should return error if not a valid type is passed", function (done) {
      chai
        .request(app)
        .get("/requests?type=RANDOM")
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Bad Request");
          expect(res.body.message).to.equal('"type" must be one of [OOO, EXTENSION, TASK, ALL, ONBOARDING]');
          done();
        });
    });
  });
});

describe("/requests Extension", function () {
  let taskId1: string;
  let taskId2: string;
  let userId1: string;
  let userId2: string;
  let superUserId: string;
  let userJwtToken1: string;
  let userJwtToken2: string;
  let superUserJwtToken: string;

  let extensionRequest = {
    type: "EXTENSION",
    title: "change ETA",
    oldEndsOn: 1694736000,
    newEndsOn: 1709674980000,
    message: "Due to some reasons",
    state: "PENDING",
  };

  const taskData = [
    {
      title: "Test task 1",
      type: "feature",
      endsOn: 1694736000,
      startedOn: 1694736000,
      status: "ACTIVE",
      percentCompleted: 10,
      participants: [],
      isNoteworthy: true,
    },
    {
      title: "Test task",
      type: "feature",
      endsOn: 1234,
      startedOn: 4567,
      status: "AVAILABLE",
      percentCompleted: 10,
      participants: [],
      isNoteworthy: true,
    },
  ];

  beforeEach(async function () {
    userId1 = await addUser(userData[16]);
    userId2 = await addUser(userData[17]);
    superUserId = await addUser(userData[4]);

    userJwtToken1 = authService.generateAuthToken({ userId: userId1 });
    userJwtToken2 = authService.generateAuthToken({ userId: userId2 });
    superUserJwtToken = authService.generateAuthToken({ userId: superUserId });

    taskId1 = (await updateTask({ ...taskData[0], assigneeId: userId1 })).taskId;
    taskId2 = (await updateTask({ ...taskData[1] })).taskId;
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /requests", function () {
    it("should return 401(Unauthorized) if user is not logged in", function (done) {
      chai
        .request(app)
        .post("/requests")
        .send(extensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });
    it("should create a new extension request", function (done) {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Extension Request created successfully!");
          done();
        });
    });

    it("should create a new extension request by super user", function (done) {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Extension Request created successfully!");
          done();
        });
    });

    it("should not create a new extension request by another user", function (done) {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken2}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(
            "Only assigned user and super user can create an extension request for this task."
          );
          done();
        });
    });

    it("should not create a new extension request if task is not exist", function (done) {
      const extensionRequestObj = {
        taskId: "randomId",
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Task Not Found");
          done();
        });
    });

    it("should not create a new extension request if assignee is not present", function (done) {
      const extensionRequestObj = {
        taskId: taskId2,
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Assignee is not present for this task");
          done();
        });
    });

    it("should not create a new extension request if old ETA does not match the task's ETA", function (done) {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
        oldEndsOn: 1234,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(extensionRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Old ETA does not match the task's ETA");
          done();
        });
    });

    it("should not create a new extension request if an extension request for this task already exists", function (done) {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
      };
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(extensionRequestObj)
        .end(async function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Extension Request created successfully!");

          const extensionRequestObj2 = {
            taskId: taskId1,
            ...extensionRequest,
          };
          const response = await chai
            .request(app)
            .post("/requests")
            .set("cookie", `${cookieName}=${userJwtToken1}`)
            .send(extensionRequestObj2);
          expect(response).to.have.status(400);
          expect(response.body).to.have.property("message");
          expect(response.body.message).to.equal("An extension request for this task already exists.");
          done();
        });
    });
  });

  describe("PUT /requests/:id", function () {
    let approvedExtensionRequestId: string;
    let rejectedExtensionRequestId: string;
    let pendingExtensionRequestId: string;

    const approvedExtensionRequest = {
      state: REQUEST_STATE.APPROVED,
      type: REQUEST_TYPE.EXTENSION,
    };

    const rejectedExtensionRequest = {
      state: REQUEST_STATE.REJECTED,
      type: REQUEST_TYPE.EXTENSION,
    };

    const invalidExtensionRequest = {
      state: "ACTIVE",
      type: REQUEST_TYPE.EXTENSION,
    };

    beforeEach(async function () {
      const extensionRequestObj = {
        taskId: taskId1,
        ...extensionRequest,
      };
      const { id: approvedId } = await createRequest({ ...extensionRequestObj, requestedBy: userId1 });
      approvedExtensionRequestId = await updateRequest(
        approvedId,
        approvedExtensionRequest,
        superUserId,
        REQUEST_TYPE.EXTENSION
      );

      const { id: rejectedId } = await createRequest({ ...extensionRequestObj, requestedBy: userId1 });
      rejectedExtensionRequestId = await updateRequest(
        rejectedId,
        rejectedExtensionRequest,
        superUserId,
        REQUEST_TYPE.EXTENSION
      );

      const { id: pendingId } = await createRequest({ ...extensionRequestObj, requestedBy: userId1 });
      pendingExtensionRequestId = pendingId;
    });

    it("should return 401(Unauthorized) if user is not logged in", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .send(approvedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Unauthenticated User");
          done();
        });
    });

    it("should return 401 if user is not super user", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(approvedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("You are not authorized for this action.");
          done();
        });
    });

    it("should return 400(Bad Request) if request is already approved", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(approvedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          const id = res.body.data.id;
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_APPROVED_SUCCESSFULLY);

          chai
            .request(app)
            .put(`/requests/${id}`)
            .set("cookie", `${cookieName}=${superUserJwtToken}`)
            .send(approvedExtensionRequest)
            .end(function (err, res) {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property("message");
              expect(res.body.message).to.equal(REQUEST_ALREADY_APPROVED);
              done();
            });
        });
    });

    it("should return 400(Bad Request) if request is already rejected", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(rejectedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          const id = res.body.data.id;
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_REJECTED_SUCCESSFULLY);

          chai
            .request(app)
            .put(`/requests/${id}`)
            .set("cookie", `${cookieName}=${superUserJwtToken}`)
            .send(rejectedExtensionRequest)
            .end(function (err, res) {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property("message");
              expect(res.body.message).to.equal(REQUEST_ALREADY_REJECTED);
              done();
            });
        });
    });

    it("should approve an extension request", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(approvedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it("should return 400(Bad Request) if invalid state is passed", function (done) {
      chai
        .request(app)
        .put(`/requests/${pendingExtensionRequestId}`)
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(invalidExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("state must be APPROVED or REJECTED");
          done();
        });
    });

    it("should return 404(Not Found) if request does not exist", function (done) {
      chai
        .request(app)
        .put(`/requests/randomId`)
        .set("cookie", `${cookieName}=${superUserJwtToken}`)
        .send(approvedExtensionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal(REQUEST_DOES_NOT_EXIST);
          done();
        });
    });
  });
});

describe("/requests Task", function () {
  let userId1: string;
  let userJwtToken1: string;

  beforeEach(async function () {
    userId1 = await addUser(userData[16]);
    userJwtToken1 = authService.generateAuthToken({ userId: userId1 });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /requests", function () {
    it("should return 401(Unauthorized) if user is not logged in", function (done) {
      chai
        .request(app)
        .post("/requests")
        .send(validTaskCreqtionRequest)
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should not create a new task request if issue does not exist", function (done) {
      const taskRequestObj = validTaskCreqtionRequest;
      taskRequestObj.externalIssueUrl = "https://api.github.com/repos/Real-Dev-Squad/website-my/issues/1245";
      taskRequestObj.userId = userId1;
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(taskRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Issue does not exist");
          done();
        });
    });

    it("should not create a new task request if task id is not present in the request body", function (done) {
      const taskRequestObj = validTaskAssignmentRequest;
      delete taskRequestObj.taskId;
      chai
        .request(app)
        .post("/requests")
        .set("cookie", `${cookieName}=${userJwtToken1}`)
        .send(taskRequestObj)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("taskId is required when requestType is ASSIGNMENT");
          done();
        });
    });
  });
});
