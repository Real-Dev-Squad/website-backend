const Sinon = require("sinon");
const { createTaskRequest, updateTaskRequest } = require("../../../middlewares/validators/taskRequests");
const { expect } = require("chai");

describe("Test the taskRequests validator", function () {
  describe("Test createTaskRequest call validator", function () {
    it("Allows the request to pass", async function () {
      const req = {
        body: {
          taskId: "1200",
          userId: "1",
        },
      };
      const res = {};
      const nextSpy = Sinon.spy();
      await createTaskRequest(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Stops the request to propogate to next", async function () {
      const req = {
        body: {
          "": "",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await createTaskRequest(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });

  describe("Test updateRequest call validator", function () {
    it("Allows the request to pass", async function () {
      const req = {
        body: {
          taskRequestId: "23",
          userId: "1",
        },
      };
      const res = {};
      const nextSpy = Sinon.spy();
      await updateTaskRequest(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Stops the request to propogate to next", async function () {
      const req = {
        body: {
          "": "",
        },
      };
      const res = {
        boom: {
          badRequest: () => {},
        },
      };
      const nextSpy = Sinon.spy();
      await updateTaskRequest(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
