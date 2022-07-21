const chai = require("chai");
const { expect } = chai;

// const firestore = require("../../../utils/firestore");
// const logsModel = firestore.collection("logs");
const logsQuery = require("../../../models/logs");

const logData = require("../../fixtures/logs/cacheLogs")();

describe("Logs", function () {
  describe("fetchMemberCacheLogs", function () {
    it("Should fetch the member cache logs", async function () {
      const { type, meta, body } = logData[0];
      const userId = meta.userId;

      await logsQuery.addLog(type, meta, body);
      const data = await logsQuery.fetchMemberCacheLogs(userId);

      expect(data[0].timestamp).to.be.an("object");
      expect(data[0].timestamp._seconds).to.be.a("number");
      expect(data[0].timestamp._nanoseconds).to.be.a("number");
      expect(data[0].type).to.be.a("string");
      expect(data[0].meta).to.be.an("object");
      expect(data[0].meta.userId).to.be.a("string");
      expect(data[0].body).to.be.an("object");
      expect(data[0].body.message).to.be.a("string");
    });
  });
});
