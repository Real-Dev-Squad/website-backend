const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");

const logsQuery = require("../../../models/logs");
const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");

const logData = require("../../fixtures/logs/cacheLogs")();
const userData = require("../../fixtures/user/user")();

let userId;

describe("Logs", function () {
  beforeEach(async function () {
    userId = await addUser(userData[0]);
  });

  after(async function () {
    await cleanDb();
  });

  describe("fetchMemberCacheLogs", function () {
    it("Should fetch the member cache logs", async function () {
      sinon.stub(logsQuery, "fetchMemberCacheLogs").returns(logData[0]);
      const data = await logsQuery.fetchMemberCacheLogs(userId);

      expect(data.timestamp).to.be.a("object");
      expect(data.timestamp._seconds).to.be.a("number");
      expect(data.timestamp._nanoseconds).to.be.a("number");
      expect(data.type).to.be.a("string");
      expect(data.meta).to.be.a("object");
      expect(data.meta.userId).to.be.a("string");
      expect(data.body).to.be.a("object");
      expect(data.body.message).to.be.a("string");

      sinon.restore();
    });
  });
});
