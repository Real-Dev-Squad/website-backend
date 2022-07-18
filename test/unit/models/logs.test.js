const chai = require("chai");
const { expect } = chai;

const firestore = require("../../../utils/firestore");
const logsModel = firestore.collection("logs");
const logsQuery = require("../../../models/logs");

const logData = require("../../fixtures/logs/cacheLogs")();

describe("Logs", function () {
  describe("fetchMemberCacheLogs", function () {
    it("Should fetch the member cache logs", async function () {
      const { type, meta, body } = logData[0];
      await logsQuery.addLog(type, meta, body);

      const data = (await logsModel.get()).docs[0].data();

      expect(data.timestamp).to.be.an("object");
      expect(data.timestamp._seconds).to.be.a("number");
      expect(data.timestamp._nanoseconds).to.be.a("number");
      expect(data.type).to.be.a("string");
      expect(data.meta).to.be.an("object");
      expect(data.meta.userId).to.be.a("string");
      expect(data.body).to.be.an("object");
      expect(data.body.message).to.be.a("string");
    });
  });
});
