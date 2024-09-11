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
const cleanDb = require("../utils/cleanDb");
const taskData = require("../fixtures/tasks/multiple-extension-requests-tasks")();
chai.use(chaiHttp);

const user = userData[5];
const appOwner = userData[3];
let userJWT;
describe("Multiple Extension Requests", function () {
  let taskId1;

  before(async function () {
    const userId = await addUser(user);
    user.id = userId;
    const appOwnerUserId = await addUser(appOwner);
    appOwner.id = appOwnerUserId;
    userJWT = authService.generateAuthToken({ userId: userId });
    // Add the active task
    taskId1 = (await tasks.updateTask(taskData[2])).taskId;
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  let fetchLatestExtensionRequestStub;

  describe("GET /extension-requests/self **when dev flag is true**", function () {
    beforeEach(function () {
      fetchLatestExtensionRequestStub = sinon.stub(extensionRequests, "fetchLatestExtensionRequest");
    });

    afterEach(function () {
      fetchLatestExtensionRequestStub.restore();
    });

    it("Dev-flag true->should return success response and an empty array of extensionRequest if assignee is not same as latest one", function (done) {
      fetchLatestExtensionRequestStub.returns({
        taskId: taskId1,
        title: "change ETA",
        assignee: "mayur",
        oldEndsOn: 1234,
        newEndsOn: 1237,
        reason: "family event",
        status: "APPROVED",
        requestNumber: 5,
        userId: "ajdf",
      });
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId1, dev: "true" })
        .set("cookie", `${cookieName}=${userJWT}`)
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

    it("Dev-flag true->should return success response and a single latestExtensionRequest if assignee same as latest one", function (done) {
      fetchLatestExtensionRequestStub.returns({
        taskId: taskId1,
        title: "change ETA",
        assigneeId: user.id,
        assignee: "mayur",
        oldEndsOn: 1234,
        newEndsOn: 1237,
        reason: "family event",
        status: "APPROVED",
        requestNumber: 5,
        userId: user.id,
        id: "12234",
      });
      chai
        .request(app)
        .get(`/extension-requests/self`)
        .query({ taskId: taskId1, dev: "true" })
        .set("cookie", `${cookieName}=${userJWT}`)
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

    it("Dev-flag true->it should return 401 if not logged in", function (done) {
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
