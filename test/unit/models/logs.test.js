const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const logsQuery = require("../../../models/logs");
const cacheData = require("../../fixtures/cloudflareCache/data");
const logsData = require("../../fixtures/logs/archievedUsers");
const app = require("../../../server");

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

  describe("GET /logs/archivedUsers", function () {
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

      expect(data).to.be.an("array").with.lengthOf(1);
      expect(data[0]).to.have.property("timestamp").that.is.an("object");
      expect(data[0].timestamp).to.have.property("_seconds").that.is.a("number");
      expect(data[0].timestamp).to.have.property("_nanoseconds").that.is.a("number");
      expect(data[0].meta).to.have.property("username").that.is.a("string");
      expect(data[0].body).to.have.property("reason").that.is.a("string");
    });
    it("Should fetch all archived logs for given username", async function () {
      const { type, meta, body } = logsData.archivedUserDetailsModal[0];
      const query = {
        username: meta.username,
      };
      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLogs(query, type);

      expect(data).to.be.an("array").to.have.lengthOf.greaterThan(0);
      expect(data[0]).to.have.property("timestamp").that.is.an("object");
      expect(data[0].timestamp).to.have.property("_seconds").that.is.a("number");
      expect(data[0].timestamp).to.have.property("_nanoseconds").that.is.a("number");
      expect(data[0].meta).to.have.property("username").that.is.a("string");
      expect(data[0].body).to.have.property("reason").that.is.a("string");
    });
    it("Should throw response status 404, if username is incorrect in the query", async function () {
      const { type, meta, body } = logsData.archivedUserDetailsModal[0];
      const query = {
        username: "TEST_USERNAME", // incorrect username
      };
      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLogs(query, type);
      const response = await chai.request(app).get(`/logs/${type}/${meta.username}`);

      expect(data).to.be.an("array").with.lengthOf(0);
      expect(response).to.have.status(404);
      expect(response.body.message).to.be.equal("Not Found");
    });
  });
});
