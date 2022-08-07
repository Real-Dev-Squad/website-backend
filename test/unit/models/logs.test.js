const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const logsQuery = require("../../../models/logs");

const cacheData = require("../../fixtures/logs/cacheLogs");

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

      expect(data[0].docId).to.be.a("string");
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

      expect(data[0].docId).to.be.a("string");
      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
    });
  });
});
