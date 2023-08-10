const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");

const { logMessageBuilder } = require("../../../services/logMessageBuilder");
const logsModel = require("../../../models/logs");
const addUser = require("../../utils/addUser");
const userData = require("../../fixtures/user/user")();
const cleanDb = require("../../utils/cleanDb");

const superUser = userData[4];

describe("logMessageBuilder", function () {
  let userId;
  before(async function () {
    userId = await addUser(superUser);

    const taskLogStructure = {
      type: "task",
      meta: {
        userId,
      },
      body: {
        subType: "update",
        new: {},
      },
    };

    const logData1 = { ...taskLogStructure };
    logData1.body.subType = "update";
    logData1.body.new = { percentCompleted: 100, status: "COMPLETED" };

    const logData2 = { ...taskLogStructure };
    logData2.body.subType = "update";
    logData2.body.new = { status: "ASSIGNED" };

    await logsModel.addLog(logData1.type, logData1.meta, logData1.body);
    await logsModel.addLog(logData2.type, logData2.meta, logData2.body);
  });

  after(async function () {
    await cleanDb();
  });

  afterEach(async function () {
    sinon.restore();
  });

  describe("Update Task Log Message", function () {
    it("Should return success response and logs with message", async function () {
      const taskLogs = await logsModel.fetchLogs("", "task");
      const messages = await Promise.all(taskLogs.map(logMessageBuilder));
      taskLogs.forEach((log) => {
        expect(log?.meta?.userId).to.equal(userId);
        expect(messages.indexOf(log.message)).to.not.equal(-1);
      });
    });
  });
});
