const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const cleanDb = require("../../utils/cleanDb");
const logsQuery = require("../../../models/logs");
const cacheData = require("../../fixtures/cloudflareCache/data");
const logsData = require("../../fixtures/logs/archievedUsers");
const app = require("../../../server");
const Sinon = require("sinon");
const { INTERNAL_SERVER_ERROR } = require("../../../constants/errorMessages");
const userData = require("../../fixtures/user/user")();
const addUser = require("../../utils/addUser");
const cookieName = config.get("userToken.cookieName");
const authService = require("../../../services/authService");
const { extensionRequestLogs } = require("../../fixtures/logs/extensionRequests");
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

      expect(response.body.message).to.equal("Logs returned successfully!");
      expect(logs).to.be.a("array").length(4);

      // Checking new fields that must be present in APPROVED Log
      expect(logs[0].body.status).to.equal("APPROVED");
      expect(logs[0].meta.extensionRequestId).to.equal(extensionRequestId);

      // Checking new fields that must be present in  DENIED Log
      expect(logs[1].body.status).to.equal("DENIED");
      expect(logs[1].meta.extensionRequestId).to.equal(extensionRequestId);

      // Validating fields when SU has changed the ETA
      expect(logs[2].meta.oldETA).to.exist.and.equal(extensionRequestLogs[2].meta.oldETA);
      expect(logs[2].meta.newETA).to.exist.and.equal(extensionRequestLogs[2].meta.newETA);

      // Validating fields when SU has changed the Title
      expect(logs[3].meta.oldTitle).to.exist.and.equal(extensionRequestLogs[3].meta.oldTitle);
      expect(logs[3].meta.newTitle).to.exist.and.equal(extensionRequestLogs[3].meta.newTitle);
    });
  });
});
