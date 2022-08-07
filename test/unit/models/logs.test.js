const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const logsQuery = require("../../../models/logs");

const cacheData = require("../../fixtures/logs/cacheLogs");

describe("Logs", function () {
  after(async function () {
    await cleanDb();
  });

  describe("fetchMemberCacheLogs", function () {
    it("Should fetch the member cache logs", async function () {
      const { type, meta, body } = cacheData.cacheLogs[0];
      const userId = meta.userId;

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchMemberCacheLogs(userId);

      expect(data[0].docId).to.be.a("string");
      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
    });
  });

  describe("fetchLastMemberCacheLogs", function () {
    it("Should fetch the member cache logs", async function () {
      const { type, meta, body } = cacheData.cacheLogs[1];
      const userId = meta.userId;

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchLastMemberCacheLog(userId);

      expect(data[0].docId).to.be.a("string");
      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
    });
  });
});
