import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";
import app from "../../server";
import cleanDb from "../utils/cleanDb";
import authService from "../../services/authService";
import userDataFixture from "../fixtures/user/user";
import addUser from "../utils/addUser";
import { createOooRequests } from "../fixtures/oooRequest/oooRequest";
import { createRequest } from "../../models/requests";
import logsQuery, { addLog } from "../../models/logs";
import { LOG_ACTION, REQUEST_LOG_TYPE } from "../../constants/requests";
import { requestsLogs } from "../fixtures/logs/requests";
import { extensionRequestLogs } from "../fixtures/logs/extensionRequests";
const { expect } = chai;
const cookieName = config.get("userToken.cookieName");

const userData = userDataFixture();
chai.use(chaiHttp);

let authToken;
let superUserToken;
let oooRequestData;
describe("/logs", function () {
  beforeEach(async function () {
    const userIdPromises = [addUser(userData[16]), addUser(userData[4])];
    const [userId, superUserId] = await Promise.all(userIdPromises);

    oooRequestData = { ...createOooRequests, requestedBy: userId };
    const requestResult = await createRequest(oooRequestData);
    const requestLog = {
      type: REQUEST_LOG_TYPE.REQUEST_CREATED,
      meta: {
        requestId: requestResult.id,
        action: LOG_ACTION.CREATE,
        createdBy: userId,
        createdAt: Date.now(),
      },
      body: requestResult,
    };
    await addLog(requestLog.type, requestLog.meta, requestLog.body);
    await addLogs();
    authToken = authService.generateAuthToken({ userId });
    superUserToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /logs", function () {
    it("should return logs of specific type", function (done) {
      chai
        .request(app)
        .get("/logs/REQUEST_CREATED")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Logs fetched successfully");
          expect(res.body.logs).to.have.lengthOf(3);
          const log = res.body.logs[0];
          expect(log).to.have.property("meta");
          expect(log).to.have.property("body");
          expect(log.type).to.equal("REQUEST_CREATED");
          return done();
        });
    });

    it("should return 401 if user is not logged in", function (done) {
      chai
        .request(app)
        .get("/logs")
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          return done();
        });
    });

    it("should return 401 if the user is not authorized to access the logs", function (done) {
      chai
        .request(app)
        .get("/logs")
        .set("cookie", `${cookieName}=${authToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal("Unauthorized");
          return done();
        });
    });

    it("should return all Logs", function (done) {
      chai
        .request(app)
        .get("/logs")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(9);
          return done();
        });
    });

    it("should return all formatted Logs", function (done) {
      chai
        .request(app)
        .get("/logs?format=feed")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(7);
          expect(res.body.data[0]).to.contain({
            username: "joygupta",
            taskTitle: "Untitled Task",
            taskId: "mZB0akqPUa1GQQdrgsx7",
            extensionRequestId: "y79PXir0s82qNAzeIn8S",
            status: "PENDING",
            type: "extensionRequests",
          });
          expect(res.body.data[0]).to.have.property("timestamp");
          expect(res.body.data[0]).to.not.have.property("body");
          expect(res.body.data[0]).to.not.have.property("meta");
          return done();
        });
    });

    it("should return logs of type = extensionRequests", function (done) {
      chai
        .request(app)
        .get("/logs?type=extensionRequests")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(4);
          return done();
        });
    });

    it("if no logs are present, should return valid response", function (done) {
      chai
        .request(app)
        .get("/logs?type=REQUEST_CREATED1")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(0);
          return done();
        });
    });

    it("should return data if page param is passed in the quey", function (done) {
      chai
        .request(app)
        .get("/logs?page=1&size=3")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(3);
          expect(res.body.page).to.equal("/logs?page=2");
          return done();
        });
    });

    it("should return valid paginated link", function (done) {
      chai
        .request(app)
        .get("/logs?size=3")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body.message).to.equal("All Logs fetched successfully");
          expect(res.body.data).to.lengthOf(3);
          expect(res.body.next).to.contain("/logs?size=3&next=");
          return done();
        });
    });
  });

  describe("Update logs", function () {
    it("should run the migration and update logs successfully", async function () {
      const res = await chai.request(app).post("/logs/migrate").set("cookie", `${cookieName}=${superUserToken}`).send();

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body.response).to.have.property("totalLogsProcessed").that.is.a("number");
      expect(res.body.response).to.have.property("totalLogsUpdated").that.is.a("number");
      expect(res.body.response).to.have.property("totalOperationsFailed").that.is.a("number");
      expect(res.body.response).to.have.property("failedLogDetails").that.is.an("array");

      expect(res.body.response.totalLogsProcessed).to.be.at.least(0);
      expect(res.body.response.totalLogsUpdated).to.be.lessThanOrEqual(res.body.response.totalLogsProcessed);

      expect(res.body.response).to.have.all.keys(
        "totalLogsProcessed",
        "totalLogsUpdated",
        "totalOperationsFailed",
        "failedLogDetails"
      );
    });

    it("should return error if unauthorized user tries to run migration", async function () {
      const res = await chai.request(app).post("/logs/migrate").set("cookie", `${cookieName}=invalidToken`).send();

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("error").that.is.a("string");
    });
  });

  describe("Add logs when user doc is update", function () {
    let jwt;
    let userId;

    beforeEach(async function () {
      userId = await addUser();
      jwt = authService.generateAuthToken({ userId });
    });

    it("Should update the users and capture the logs", async function () {
      const res = await chai.request(app).patch("/users/self").set("cookie", `${cookieName}=${jwt}`).send({
        first_name: "Test first_name",
      });

      expect(res).to.have.status(204);

      const logRes = await chai
        .request(app)
        .get("/logs/USER_DETAILS_UPDATED")
        .set("cookie", `${cookieName}=${superUserToken}`);

      expect(logRes).to.have.status(200);
      expect(logRes.body.message).to.equal("Logs fetched successfully");

      const log = logRes.body.logs[0];
      expect(log).to.have.property("meta");
      expect(log).to.have.property("body");
      expect(log.type).to.equal("USER_DETAILS_UPDATED");
    });
  });
});

async function addLogs() {
  for (const request of requestsLogs) {
    const { type, meta, body } = request;
    await logsQuery.addLog(type, meta, body);
  }
  for (const request of extensionRequestLogs) {
    const { type, meta, body } = request;
    await logsQuery.addLog(type, meta, body);
  }
}
