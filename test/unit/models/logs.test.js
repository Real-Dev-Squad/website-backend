const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const cleanDb = require("../../utils/cleanDb");
const logsQuery = require("../../../models/logs");
const cacheData = require("../../fixtures/cloudflareCache/data");
const logsData = require("../../fixtures/logs/archievedUsers");
const { requestsLogs } = require("../../fixtures/logs/requests");
const app = require("../../../server");
const Sinon = require("sinon");
const { INTERNAL_SERVER_ERROR } = require("../../../constants/errorMessages");
const userData = require("../../fixtures/user/user")();
const addUser = require("../../utils/addUser");
const cookieName = config.get("userToken.cookieName");
const authService = require("../../../services/authService");
const { extensionRequestLogs } = require("../../fixtures/logs/extensionRequests");
const { LOGS_FETCHED_SUCCESSFULLY } = require("../../../constants/logs");
const tasks = require("../../../models/tasks");
const tasksData = require("../../fixtures/tasks/tasks")();
chai.use(chaiHttp);
const superUser = userData[4];
const userToBeMadeMember = userData[1];

describe("Logs", function () {
  after(async function () {
    await cleanDb();
  });

  describe("Fetch purged cache logs", function () {
    it("Should fetch the purged cache logs", async function () {
      const { type, meta, body } = cacheData.cacheLogs[0];
      const userId = meta.userId;

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchCacheLogs(userId);

      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
    });
  });

  describe("Fetch the last added purged cache log", function () {
    it("Should fetch the last added purged cache log", async function () {
      const { type, meta, body } = cacheData.cacheLogs[0];
      const userId = meta.userId;

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLastAddedCacheLog(userId);

      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
    });
  });

  describe("GET /logs/archived-details", function () {
    let addLogsStub;
    let jwt;

    beforeEach(async function () {
      const superUserId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId: superUserId });
      await cleanDb();
    });

    afterEach(function () {
      Sinon.restore();
    });

    it("Should return an Internal server error message", async function () {
      addLogsStub = Sinon.stub(logsQuery, "fetchLogs");
      addLogsStub.throws(new Error(INTERNAL_SERVER_ERROR));

      addUser(userToBeMadeMember).then(() => {
        const res = chai.request(app).get("/logs/archived-details").set("cookie", `${cookieName}=${jwt}`).send();
        expect(res.body.message).to.equal(INTERNAL_SERVER_ERROR);
      });
    });

    it("Should return empty array if no logs found", async function () {
      const { type } = logsData.archivedUserDetailsModal[0];
      const query = {};

      const data = await logsQuery.fetchLogs(query, type);

      expect(data).to.be.an("array").with.lengthOf(0);
    });

    it("Should fetch all archived logs", async function () {
      const { type, meta, body } = logsData.archivedUserDetailsModal[0];
      const query = {};

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLogs(query, type);

      expect(data).to.be.an("array").with.lengthOf.greaterThan(0);
      expect(data[0]).to.have.property("timestamp").that.is.an("object");
      expect(data[0].timestamp).to.have.property("_seconds").that.is.a("number");
      expect(data[0].timestamp).to.have.property("_nanoseconds").that.is.a("number");
      expect(data[0].body.archived_user).to.have.property("username").that.is.a("string");
      expect(data[0].body).to.have.property("reason").that.is.a("string");
    });

    it("Should fetch all archived logs for given user_id", async function () {
      const { type, meta, body } = logsData.archivedUserDetailsModal[0];
      const query = {
        userId: body.archived_user.user_id,
      };
      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLogs(query, type);

      expect(data).to.be.an("array").with.lengthOf.greaterThan(0);
      expect(data[0]).to.have.property("timestamp").that.is.an("object");
      expect(data[0].timestamp).to.have.property("_seconds").that.is.a("number");
      expect(data[0].timestamp).to.have.property("_nanoseconds").that.is.a("number");
      expect(data[0].body).to.have.property("reason").that.is.a("string");
    });

    it("Should throw response status 404, if username is incorrect in the query", async function () {
      const { type, meta, body } = logsData.archivedUserDetailsModal[0];
      const query = {
        userId: "1234_test", // incorrect username
      };
      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLogs(query, type);
      const response = await chai.request(app).get(`/logs/${type}/${query}`);

      expect(data).to.be.an("array").with.lengthOf(0);
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("Not Found");
    });
  });

  describe("GET /logs", function () {
    before(async function () {
      await addLogs();
      const tasksPromise = tasksData.map(async (task) => {
        await tasks.updateTask(task);
      });
      await Promise.all(tasksPromise);
    });

    after(async function () {
      await cleanDb();
    });

    it("Should return all the logs as per the size passed = 3", async function () {
      const result = await logsQuery.fetchAllLogs({ size: 3 });
      expect(result.allLogs).to.have.lengthOf(3);
      expect(result).to.have.any.key("prev");
      expect(result).to.have.any.key("next");

      expect(result.next).to.not.be.null;
    });

    it("Should return all the logs as per the size passed = 3 and page passed", async function () {
      const PAGE = 1;
      const result = await logsQuery.fetchAllLogs({ size: 3, page: PAGE });
      expect(result.allLogs).to.have.lengthOf(3);
      expect(result).to.have.any.key("prev");
      expect(result).to.have.any.key("next");
      expect(result.page).to.equal(PAGE + 1);
    });

    it("Should return all the logs as per the next and prev", async function () {
      const PAGE = 1;
      const result = await logsQuery.fetchAllLogs({ size: 3, page: PAGE });
      expect(result.allLogs).to.have.lengthOf(3);
      const nextData = await logsQuery.fetchAllLogs({ next: result.next });
      expect(nextData.allLogs).to.have.lengthOf(4);
      expect(nextData).to.have.any.key("prev");
      expect(nextData).to.have.any.key("next");

      expect(nextData.prev).to.not.be.null;
      const prevData = await logsQuery.fetchAllLogs({ prev: nextData.prev });
      expect(prevData).to.have.any.key("prev");
      expect(prevData).to.have.any.key("next");

      expect(prevData.next).to.exist;
    });

    it("Should return all the logs in formatted view", async function () {
      const result = await logsQuery.fetchAllLogs({ size: 3, format: "feed" });
      expect(result.allLogs).to.have.lengthOf(3);
      expect(result.allLogs[1]).to.have.property("timestamp").that.is.a("number");
      expect(result.allLogs[1]).to.not.have.property("body");
      expect(result.allLogs[1]).to.not.have.property("meta");
      expect(result.allLogs[1]).to.have.property("type");
      expect(result).to.have.any.key("prev");
      expect(result).to.have.any.key("next");
    });

    it("Should return all the logs for specific types", async function () {
      const result = await logsQuery.fetchAllLogs({ size: 3, type: "REQUEST_CREATED" });
      expect(result.allLogs).to.have.lengthOf(2);
      const uniqueTypes = new Set(result.allLogs.map((log) => log.type));
      expect(Array.from(uniqueTypes)[0]).to.equal("REQUEST_CREATED");
    });

    it("Should throw error when start date is greater than end date in dev mode", async function () {
      await cleanDb();

      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate - 86400;

      try {
        await logsQuery.fetchAllLogs({
          dev: "true",
          startDate: startDate.toString(),
          endDate: endDate.toString(),
          size: 3,
        });
        throw new Error("Expected fetchAllLogs to throw an error, but it did not.");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("Start date cannot be greater than end date.");
        expect(error).to.have.property("statusCode", 400);
      }
    });

    it("Should return logs within the specified date range in dev mode", async function () {
      await cleanDb();

      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - 86400 * 7;
      const result = await logsQuery.fetchAllLogs({
        dev: "true",
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        size: 3,
      });

      expect(result).to.have.property("allLogs");
      if (result.allLogs.length > 0) {
        result.allLogs.forEach((log) => {
          expect(log).to.have.property("timestamp").that.is.a("number");
          expect(log.timestamp).to.be.at.least(startDate);
          expect(log.timestamp).to.be.at.most(endDate);
        });
      }
    });

    it("Should ignore date filters when not in dev mode", async function () {
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - 86400 * 7;

      const result = await logsQuery.fetchAllLogs({
        dev: "false",
        startDate: startDate.toString(),
        endDate: endDate.toString(),
        size: 3,
      });

      expect(result).to.have.property("allLogs");
      expect(result).to.have.property("prev");
      expect(result).to.have.property("next");
      expect(result).to.have.property("page");
    });

    it("Should handle only start date filter in dev mode", async function () {
      const startDate = Math.floor(Date.now() / 1000) - 86400 * 14;

      const result = await logsQuery.fetchAllLogs({
        dev: "true",
        startDate: startDate.toString(),
        size: 3,
      });

      expect(result).to.have.property("allLogs");
      expect(result).to.have.property("prev");
      expect(result).to.have.property("next");

      if (result.allLogs.length > 0) {
        result.allLogs.forEach((log) => {
          expect(log).to.have.property("timestamp").that.is.a("number");
          expect(log.timestamp).to.be.at.least(startDate);
        });
      }
    });

    it("Should handle only end date filter in dev mode", async function () {
      const endDate = Math.floor(Date.now() / 1000);

      const result = await logsQuery.fetchAllLogs({
        dev: "true",
        endDate: endDate.toString(),
        size: 3,
      });

      expect(result).to.have.property("allLogs");
      expect(result).to.have.property("prev");
      expect(result).to.have.property("next");

      if (result.allLogs.length > 0) {
        result.allLogs.forEach((log) => {
          expect(log).to.have.property("timestamp").that.is.a("number");
          expect(log.timestamp).to.be.at.most(endDate);
        });
      }
    });

    it("Should return null if no logs are presnet  the logs for specific types", async function () {
      await cleanDb();
      const result = await logsQuery.fetchAllLogs({});
      expect(result.allLogs).to.lengthOf(0);
    });

    it("should throw an error and log it", async function () {
      Sinon.stub(logsQuery, "fetchAllLogs").throws(new Error(INTERNAL_SERVER_ERROR));
      try {
        await logsQuery.fetchAllLogs({});
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("An internal server error occurred");
      }
    });
  });

  describe("GET /logs/extension-request", function () {
    let jwt;
    let userId;

    before(async function () {
      userId = await addUser(superUser);
      jwt = authService.generateAuthToken({ userId });
    });

    after(async function () {
      await cleanDb();
    });

    it("Should return all the logs related to extension requests", async function () {
      Sinon.stub(logsQuery, "fetchLogs").returns(extensionRequestLogs);

      const extensionRequestId = "y79PXir0s82qNAzeIn8S";
      const response = await chai
        .request(app)
        .get(`/logs/extensionRequests?meta.extensionRequestId=${extensionRequestId}&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send();

      const logs = response.body.logs;

      expect(response.body.message).to.equal(LOGS_FETCHED_SUCCESSFULLY);
      expect(logs).to.be.a("array").length(4);

      // Checking new fields that must be present in APPROVED Log
      expect(logs[0].body.status).to.equal("APPROVED");
      expect(logs[0].meta.extensionRequestId).to.equal(extensionRequestId);

      // Checking new fields that must be present in  DENIED Log
      expect(logs[1].body.status).to.equal("DENIED");
      expect(logs[1].meta.extensionRequestId).to.equal(extensionRequestId);
      // Validating fields when SU has changed the ETA
      expect(logs[2].body.oldEndsOn).to.exist.and.equal(extensionRequestLogs[2].body.oldEndsOn);
      expect(logs[2].body.newEndsOn).to.exist.and.equal(extensionRequestLogs[2].body.newEndsOn);

      // Validating fields when SU has changed the Title
      expect(logs[3].body.oldTitle).to.exist.and.equal(extensionRequestLogs[3].body.oldTitle);
      expect(logs[3].body.newTitle).to.exist.and.equal(extensionRequestLogs[3].body.newTitle);
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
